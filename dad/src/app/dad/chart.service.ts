/**
 * Created by pabloelustondo on 2016-11-21.
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
import * as _ from "lodash";
import { Headers, Http,URLSearchParams, Response, RequestOptions } from '@angular/http';
import { config } from "./appconfig";
import { Observable } from 'rxjs/Rx';

@Injectable()
export class DadChartConfigsService {

    constructor(private http: Http) { }

    public save2ddb(){
      //this method will save the current configuration in local storage to the server
      let charts = localStorage.getItem("chartdata");
      let widgets = localStorage.getItem("widgetdata");
      let tables = localStorage.getItem("tabledata");
      let pages = localStorage.getItem("pagedata");
      let timeStamp = Date.now().toString();
      let daduserconfig = {
        userid: 'dadtenant-daduser',
        username: 'daduser',
        tenantid: 'dadtenant',
        config: { timeStamp: timeStamp,
        charts: charts}
      }

      let token = localStorage.getItem('id_token');
      let headers = new Headers({ 'Content-Type': 'application/json',  'x-access-token' : token});
      let url = config.dadback_url + "/daduser/"+ daduserconfig.userid;
      this.http.post(url, daduserconfig, headers).toPromise().then(
          (res:Response) => {
            console.log('configuration saved' + JSON.stringify(res));
          }).catch(
          (error) =>{
            console.log('configuration failed to save')
          }
         );
    }

    public clearLocalCopy(){
      localStorage.removeItem("chartdata");
    }

  public save(charts:DadChart[] ){
    let charts_string = JSON.stringify(charts);
    localStorage.setItem("chartdata",charts_string);
    this.save2ddb();
  }

  public saveOne(chart:DadChart ){
    let charts:DadChart[] = this.getChartConfigs();
    let chartIndex = _.findIndex(charts, function(w) { return w.id == chart.id; });
    if(chartIndex === -1){
      charts.push(chart);
    } else {
      charts.splice(chartIndex, 1, chart);
    }
    this.save(charts);
  }

    public getChartConfigs(): DadChart[] {

      let charts_string = localStorage.getItem("chartdata");

      if (charts_string != null){
        let charts_obj = JSON.parse(charts_string);
        let DATA = charts_obj as DadChart[];
        return DATA;
      }
      else {
        this.save(CHARTS);
        return CHARTS;
      }
    }

  public getChartConfig(id:string): DadChart {
    let charts = this.getChartConfigs();
    let chartIndex = _.findIndex(charts, function(w) { return w.id == id; });
    return charts[chartIndex];
  }

}

@Injectable()
export class DadWidgetConfigsService {

  public clearLocalCopy(){
    localStorage.removeItem("widgetdata");
}

  public saveOne(widget:DadWidget ){
    let widgets:DadWidget[] = this.getWidgetConfigs();
    let widgetIndex = _.findIndex(widgets, function(w) { return w.id == widget.id; });
    widgets.splice(widgetIndex, 1, widget);
    this.save(widgets);
  }

public save(widgets:DadWidget[] ){
  let widgets_string = JSON.stringify(widgets);
  localStorage.setItem("widgetdata",widgets_string);
}

public getWidgetConfig(id:string): DadWidget {
    let widgets = this.getWidgetConfigs();
    let widgetIndex = _.findIndex(widgets, function(w) { return w.id == id; });
    return widgets[widgetIndex];
}

public getWidgetConfigs(): DadWidget[] {

  let widget_string = localStorage.getItem("widgetdata");

  if (widget_string != null){
    let widget_obj = JSON.parse(widget_string);
    let DATA = widget_obj as DadWidget[];
    return DATA;
  }
  else {
    let widget_string = JSON.stringify(WIDGETS);
    localStorage.setItem("widgetdata",widget_string);
    return WIDGETS;
  }
}
}

@Injectable()
export class DadTableConfigsService {

  public clearLocalCopy(){
    localStorage.removeItem("tabledata");
  }

  public save(tables:DadTable[] ){
    let tables_string = JSON.stringify(tables);
    localStorage.setItem("tabledata",tables_string);
  }

  public saveOne(table:DadTable ){
    let tables:DadTable[] = this.getTableConfigs();
    let tableIndex = _.findIndex(tables, function(w) { return w.id == table.id; });
    if(tableIndex === -1){
      tables.push(table);
    } else {
      tables.splice(tableIndex, 1, table);
    }
    this.save(tables);
  }

  public getTableConfig(id:string): DadTable {
    let tables = this.getTableConfigs();
    let tableIndex = _.findIndex(tables, function(w) { return w.id == id; });
    return tables[tableIndex];
  }

  public getTableConfigs(): DadTable[] {

    let tables_string = localStorage.getItem("tabledata");

    if (tables_string != null){
      let table_obj = JSON.parse(tables_string);
      let DATA = table_obj as DadTable[];
      return DATA;
    }
    else {
      let tables_string = JSON.stringify(TABLES);
      localStorage.setItem("tabledata",tables_string);
      return TABLES;
    }
  }
}

@Injectable()
export class DadPageConfigsService {

  public clearLocalCopy(){
    localStorage.removeItem("pagedata");
  }

  public save(pages:DadPage[] ){
    let pages_string = JSON.stringify(pages);
    localStorage.setItem("pagedata",pages_string);
  }

  public getPageConfig(id:string): DadPage {
    let pages = this.getPageConfigs();
    let pageIndex = _.findIndex(pages, function(w) { return w.id == id; });
    return pages[pageIndex];
  }

  public getPageConfigs(): DadPage[] {

    let pages_string = localStorage.getItem("pagedata");

    if (pages_string != null){
      let page_obj = JSON.parse(pages_string);
      let DATA = page_obj as DadPage[];
      return DATA;
    }
    else {
      let pages_string = JSON.stringify(PAGES);
      localStorage.setItem("pagedata",pages_string);
      return PAGES;
    }
  }
}
