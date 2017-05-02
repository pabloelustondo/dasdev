/**
 * Created by dister on 5/2/2017.
 */
import { Injectable } from '@angular/core';
import { CHARTS } from './sample.charts';
import { DadChart } from './chart.component';
import { DadWidget } from "./widget.component";
import { DadTable } from "./table.component";
import { DadPage } from "./page.component";
import { WIDGETS } from "./sample.widgets";
import { TABLES } from "./sample.tables";
import { PAGES } from './sample.page';
import { DadElement } from './dadmodels';
import * as _ from "lodash";
import { Headers, Http,URLSearchParams, Response, RequestOptions } from '@angular/http';
import { config } from "./appconfig";
import { Observable } from 'rxjs/Rx';
import { DadUser } from "./dadmodels";
import { JwtHelper } from 'angular2-jwt';

@Injectable()
export class DadConfigService {

    user:DadUser;
    token: string;
    jwtHelper = new JwtHelper();

    constructor(private http: Http) {
        if (config.testing){
            this.user = {username:"user", tenantid:"test", userid:"test-user"};
        } else {
            let token = localStorage.getItem('id_token');
            let u =  this.jwtHelper.decodeToken(token);
            let username = u.username;
            let tenantid = u.tenantId;
            let userid = tenantid + "-" + username;
            this.user = {username:username, tenantid:tenantid, userid:userid};
        }

        localStorage.setItem('daduser',JSON.stringify(this.user));
    }

    public getUserConfigurationFromDdb(): Promise<any>{
        //this method will get the current configuration from server and store it in local storage

        let headers = new Headers({ 'Content-Type': 'application/json',  'x-access-token' : this.token});
        let url = config.dadback_url + "/daduser/"+ this.user.userid;
        return this.http.get(url).toPromise();
    }

    public saveUserConfigurationToDdb(data){
        //this method will save the current configuration in local storage to the server
        let timeStamp = Date.now().toString();
        let charts = data.config.charts;
        let widgets = data.config.widgets;
        let tables = data.config.tables;
        let pages = data.config.pages;

        let config = { timeStamp: timeStamp,
            charts: charts,
            widgets: widgets,
            tables:tables,
            pages:pages};

        let elements = localStorage.getItem("config");

        let daduserconfig = {
            userid: this.user.userid,
            username: this.user.username,
            tenantid: this.user.tenantid,
        }

        let headers = new Headers({ 'Content-Type': 'application/json',  'x-access-token' : this.token});
        let url = config.dadback_url + "/daduser/"+ daduserconfig.userid;
        this.http.post(url, daduserconfig).toPromise().then(
            (res:Response) => {
                console.log('configuration saved' + JSON.stringify(res));
            }).catch(
            (error) =>{
                console.log('configuration failed to save')
            }
        );
    }

    public clearLocalCopy(){
        localStorage.removeItem("elementdata");
    }

    public save(elements:DadElement[] ){
        let elements_string = JSON.stringify(elements);
        localStorage.setItem("elementdata",elements_string);
        if (!config.testing) this.saveUserConfigurationToDdb();
    }

    public saveOne(element:DadElement ){
        let elements:DadElement[];

        this.getConfigs().then((elements:DadElement[]) =>{

                let chartIndex = _.findIndex(elements, function(w) { return w.id == element.id; });
                if(chartIndex === -1){
                    elements.push(element);
                } else {
                    elements.splice(chartIndex, 1, element);
                }
                this.save(elements);
            }
        );

    }

    public getChartConfigs(): Promise<any> {
        if (elements_string == null && config.testing){
            localStorage.setItem("chartdata", JSON.stringify(CHARTS));
            return Promise.resolve(CHARTS);
        }
        return  Promise.resolve(config.charts as DadChart); }

    public getConfigs(): Promise<any> {
        let elements_string = localStorage.getItem("elementdata");
//cast here


        if (elements_string != null){
            let elements_obj = JSON.parse(elements_string);
            let DATA = elements_obj as DadElement[];
            return Promise.resolve(DATA);
        }
        else {
            return this.getUserConfigurationFromDdb().then(
                (data) => {
                    let dataObj = JSON.parse(data._body)[0];
                    this.saveConfigFromDb(dataObj);
                    let chartsString = localStorage.getItem("config");
                    let charts = JSON.parse(chartsString);
                    return Promise.resolve(charts as DadChart);
                },
                (error) => {
                    console.log(error);
                }
            );
        }
    }

    public saveConfigFromDb(data){
            let charts = data.config.charts;
            let widgets = data.config.widgets;
            let tables = data.config.tables;
            let pages = data.config.pages;
        //comment: for some reason charts, widgets...etc.. are already JSON...why?
            localStorage.setItem("chartdata", charts);
            localStorage.setItem("widgetdata", widgets);
            localStorage.setItem("tabledata", tables);
            localStorage.setItem("pagedata", pages);
    }

    public getConfig(id:string): Promise<DadChart> {
        return this.getConfigs().then((charts:DadChart[]) =>{
            let chartIndex = _.findIndex(charts, function(w) { return w.id == id; });
            if (chartIndex>-1) return Promise.resolve(charts[chartIndex]);
            else return Promise.resolve(null);
        });
    }
}