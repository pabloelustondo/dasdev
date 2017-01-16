/**
 * Created by dister on 1/12/2017.
 */
import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { DadChart } from "./chart.component";
import {DadElementDataService } from "./data.service";
import {DadWidgetConfigsService, DadChartConfigsService} from './chart.service';
import { Mapper } from "./mapper";
import { DadParameter, DadParameterType, DadMetric, DadMetricType, DadDimension, DadDimensionType, DadElement} from "./dadmodels"
import {DadWidget} from "./widget.component";

@Component({
    selector: 'dadparameters',
    providers: [DadElementDataService, DadWidgetConfigsService, DadChartConfigsService],
    template: `
    <div class="row">
          <div *ngIf="editMode">          
            <div *ngFor="let uiparam of element.uiparameters">
               <div><label>{{uiparam.Name}}</label></div>
               
               <div *ngIf="uiparam.Type == dadParameterType.Date">
               <input type="date" [(ngModel)]="uiparam.Value"/>       
               </div>
               
               <div *ngIf="uiparam.Type == dadParameterType.DateTime">
               <input type="date" [(ngModel)]="uiparam.Value['D']"/>       
               <timepicker [(ngModel)]="uiparam.Value['T']" (change)="changed()" [hourStep]="hstep" [minuteStep]="mstep" [showMeridian]=false [readonlyInput]="false"></timepicker>       
               </div>
    
               <div *ngIf="uiparam.Type == dadParameterType.Duration">
               <timepicker [(ngModel)]="uiparam.Value" (change)="changed()" [hourStep]="hstep" [minuteStep]="mstep" [showMeridian]=false [readonlyInput]="false"></timepicker>
               </div>
               <div *ngIf="uiparam.Type == dadParameterType.Number"><input type="number" min="0" max="100" [(ngModel)]="uiparam.Value" /></div>  
               <div *ngIf="uiparam.Type == dadParameterType.String"><input type="text" [(ngModel)]="uiparam.Value" /></div>   
            </div>
            <!--refresh button here-->
            <br/>
            <div class="col-md-4 text-center">
            <button (click)="onRefresh()" style="border-color:white; color:white; margin-left:-15px;" type="button" class="btn btn-secondary-active">
                <span class="glyphicons glyphicons-refresh"></span>
            </button>
            <br/><br/>
            </div>
            <div>
            <!--This is actually close button-->
            <button (click)="onEdit()" style="color:white;" type="button" class="btn btn-secondary-active pull-right">
                <span class="glyphicons glyphicons-remove"></span>
            </button>
            </div>     
          </div>
    </div>      
      
    <div class="row">
       <div *ngIf="!editMode">          
         <span *ngFor="let uiparam of element.uiparameters">
         <!--<div><label style="text-decoration: underline">{{uiparam.Name}} :</label></div> -->
            <span *ngIf="uiparam.Type == dadParameterType.DateTime">
                {{uiparam.Value['D']  }} {{addingZero(uiparam.Value['T'].getHours())}}:{{addingZero(uiparam.Value['T'].getMinutes())}}                        
            </span>
         <!--<div *ngIf="uiparam.Type == dadParameterType.Duration">{{addingZero(uiparam.Value.getHours())}}:{{addingZero(uiparam.Value.getMinutes())}}</div>
         <div *ngIf="uiparam.Type == dadParameterType.Number">{{uiparam.Value}}</div>-->
            <span *ngIf="uiparam.Type == dadParameterType.String && uiparam.Value!='custom'">({{uiparam.Value}})</span> 
         </span>      
       </div>
    </div>
    `
})

export class DadParametersComponent implements OnInit {
    @Input()
    element: DadElement;
    data;
    mapper: Mapper = new Mapper();
    dadParameterType = DadParameterType;
    @Input()
    editMode:boolean = false;

    constructor(private dadElementDataService: DadElementDataService,
                private dadWidgetConfigsService: DadWidgetConfigsService) {}

    ngOnInit() {
        this.mapParameters2ui();
        this.mapParameters2model();

    }

    onEdit(message:string):void{
        if (!this.editMode) this.editMode = true
        else this.editMode = false;
    }
/*
    onRefresh(message:string):void{
        this.mapParameters2model();
        this.dadWidgetConfigsService.saveOne(this.element);
        this.dadElementDataService.getElementData(this.element).then(
            data => {
                this.data = data.data[0];
                this.fixDataNulls();
            }
        ).catch(err => console.log(err.toString()));
    }
*/
    mapParameters2model():void{
        //this action will map UI parameters into model parameters back
        let parameters = this.element.parameters[0];   //maybe we need to stop having a list?
        if(!this.element.uiparameters){
            return;
        }
        for (let uiparam of this.element.uiparameters) {

            if (uiparam.Type === this.dadParameterType.Date) {
                let date:Date = new Date(uiparam.Value);
                parameters[uiparam.DataSource] = date.toISOString();
            }

            if (uiparam.Type === this.dadParameterType.DateTime) {

                let datetime:Date = new Date(uiparam.Value['D']);
                let time:Date = uiparam.Value['T'];
                datetime.setUTCHours(time.getUTCHours(), time.getUTCMinutes());
                parameters[uiparam.DataSource] = datetime.toISOString();

            }
            if (uiparam.Type === this.dadParameterType.Number) {
                parameters[uiparam.DataSource] = uiparam.Value;
            }
            if (uiparam.Type === this.dadParameterType.String) {
                parameters[uiparam.DataSource] = uiparam.Value;
            }
            if (uiparam.Type === this.dadParameterType.Duration) {
                parameters[uiparam.DataSource] = this.mapDate2LongDuration(uiparam.Value);
            }
        }
    }

    mapParameters2ui():void{
        //this action will map model parameters into UI parameters
        let parameters = this.element.parameters[0];   //maybe we need to stop having a list?
        if(!this.element.uiparameters){
            return;
        }
        for (let uiparam of this.element.uiparameters) {
            if (uiparam.Type === this.dadParameterType.DateTime) {
                let d: Date;
                if (parameters[uiparam.DataSource+"Auto"]=="yesterday"){
                    let dold = new Date(parameters[uiparam.DataSource]);
                    let hrs = dold.getHours();
                    let mins = dold.getMinutes();
                    let secs  = dold.getSeconds();
                    d = new Date();
                    d.setDate(d.getDate() - 1);
                    d.setHours(hrs,mins,secs);
                }else{ // we assume that we have a valid date
                    d = new Date(parameters[uiparam.DataSource]);
                }
                let yyyy = d.getFullYear();
                let m = d.getMonth()+1;
                let day = d.getDate();
                let mm = (m <10 )? "0" + m : "" + m;
                let dd = (day <10 )? "0" + day : "" + day;
                uiparam.Value = {};
                uiparam.Value['D'] = yyyy + "-" + mm + "-" + dd;
                uiparam.Value['T'] = d;
            }

            if (uiparam.Type === this.dadParameterType.Date) {
                let d: Date;
                if (parameters[uiparam.DataSource+"Auto"]=="yesterday"){
                    d = new Date();
                    d.setDate(d.getDate() - 1);
                }else{ // we assume that we have a valid date
                    d = new Date(parameters[uiparam.DataSource]);
                }
                let yyyy = d.getFullYear();
                let m = d.getMonth()+1;
                let day = d.getDate();
                let mm = (m <10 )? "0" + m : "" + m;
                let dd = (day <10 )? "0" + day : "" + day;
                uiparam.Value = {};
                uiparam.Value = yyyy + "-" + mm + "-" + dd;
                uiparam.Value = d;
            }

            if (uiparam.Type === this.dadParameterType.Number) {
                uiparam.Value = parameters[uiparam.DataSource];
            }
            if (uiparam.Type === this.dadParameterType.String) {
                uiparam.Value = parameters[uiparam.DataSource];
            }
            if (uiparam.Type === this.dadParameterType.Duration) {
                let Iduration: number = parameters[uiparam.DataSource];
                let Tduration = this.mapLongDuration2Date(Iduration);
                uiparam.Value = Tduration;
            }
        }
    }

    mapLongDuration2Date ( duration:number): Date {

        let hrs = Math.floor(duration);
        let mins = (duration - hrs) * 60;
        let time = new Date();
        time.setHours(hrs,mins);
        return time;
    }

    mapDate2LongDuration ( duration:Date): number {

        let hrs = duration.getHours();
        let mins = duration.getMinutes();
        let durationLong:number = hrs + mins/60;
        return durationLong;
    }

    fixDataNulls(){
        if (this.data[this.element.metrics[0].DataSource] === null) this.data[this.element.metrics[0].DataSource] = 0;
        if (this.data[this.element.metrics[1].DataSource] === null) this.data[this.element.metrics[1].DataSource] = 0;
        if (this.data[this.element.metrics[2].DataSource] === null) this.data[this.element.metrics[2].DataSource] = 0;
        if (this.data[this.element.metrics[3].DataSource] === null) this.data[this.element.metrics[3].DataSource] = 0;
    }

    addingZero(x:number):string{
        return (x <10 )? "0" + x : "" + x;
    }

}


