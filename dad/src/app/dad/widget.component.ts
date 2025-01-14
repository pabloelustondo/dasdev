import { Component, Input, Output, OnInit, AfterViewInit, EventEmitter } from '@angular/core';
import { DadChart } from "./chart.component";
import { DadPage } from "./page.component";
import { DadElementDataService } from "./data.service";
import { DadConfigService } from './dadconfig.service';
import { Mapper } from "./mapper";
import { Router, ActivatedRoute } from "@angular/router";
import { DadParameter, DadParameterType, DadMetric, DadMetricType, DadAlert, DadAlertType, DadFilter, DadFilterType, DadDimension, DadDimensionType, DadElement } from "./dadmodels"
import { config } from "./appconfig";

export enum DadWidgetType { OneNumber, Chart };

export class DadWidget extends DadElement{

    constructor(){
        super();
        this.elementType = 'widget';
    }

  type: DadWidgetType;
  chart?: DadChart;
  drillTo?: string;
}

@Component({
  selector: 'dadwidget',
  providers:[DadElementDataService, DadConfigService],
  template: `   

<div class="dadWidget">
  <div class="col-sm-4 col-lg-3">  
     <div class="inside">
        <div class="content card card-inverse card-primary">
            <div class="card-block pb-0">
                <div class="btn-group float-xs-right" dropdown>
                    <button type="button" class="btn btn-transparent dropdown-toggle p-0" dropdownToggle>
                        <i class="icon-settings"></i>
                    </button>   

                    <div class="dropdown-menu dropdown-menu-right" dropdownMenu>
                        <button class="dropdown-item" style="cursor:pointer;"> <div (click)="onEdit('lalal')">Edit</div></button>
                        <button class="dropdown-item" style="cursor:pointer;"> <div>Select a Data Set</div></button>
                        <button class="dropdown-item" style="cursor:pointer;"> <div (click)="onRawData()">See raw fact data</div></button>
                        <button *ngIf="widget.type==0 && widget.metrics.length>2" class="dropdown-item" style="cursor:pointer;"> <div (click)="onMoreDetails('lalal')">More Details</div></button>
                        <button class="dropdown-item" style="cursor:pointer;"> <div (click)="onRefresh()">Refresh</div></button>
                        <button class="dropdown-item" style="cursor:pointer;"> <div (click)="onRemoveFromPage('lalal')">Remove From Page</div></button>            
                    </div>
                </div>
                
                <label style="margin-right: 10px;" class="switch switch-text switch-pill switch-success pull-right pb-1">
                    <input type="checkbox" class="switch-input" (click)="onRealDataMonitoring()">
                    <span class="switch-label" data-on="On" data-off="Off"></span>
                    <span class="switch-handle"></span>
                </label>
 
               <div *ngIf="widget.type===0">
                <div [id]="widget.id + '_0_name'" class="card-title m-l-5">{{widget.metrics[0].Name}}</div>
                <h3 id="mrbs" *ngIf="data" class="mb-0">
                    <div style="cursor:pointer;" *ngIf="!(data[0][widget.metrics[0].DataSource]===0)" (click)="onDrill('lalala')">
                        <span [id]="widget.id + '_0_value'" style="font-size: 7.5vw; color:white;">{{data[0][widget.metrics[0].DataSource]}} </span>
                    </div>
                    <a *ngIf="(data[0][widget.metrics[0].DataSource]===0)">
                        <span style="font-size: 7.5vw; color:white;">{{data[0][widget.metrics[0].DataSource]}} </span>
                    </a>
                    <br/>out of {{data[0][widget.metrics[1].DataSource]}} 
                </h3><br/>
                <div *ngIf="data" class="col-sm-6">
                   <progress style=" display:inline-block; margin-bottom: -.5px; margin-left: -15px;" class="progress progress-xs progress-danger pull-md-left" value="{{data[0][widget.metrics[0].DataSource]}}" max="{{data[0][widget.metrics[1].DataSource]}}"></progress>                                                          
                </div>
                <div *ngIf="data">{{percentageOfTotal()}}%</div>     
                <br/><br/>
                <div *ngIf="moreDetails && data && widget.metrics.length>2">
                    <div>{{widget.metrics[2].Name}}</div> 
                    <div>{{data[0][widget.metrics[2].DataSource]}}</div> 
                    <div class="col-sm-6">
                       <progress style="margin-left:-15px;" *ngIf="data" class="progress progress-xs progress-danger" value="{{data[0][widget.metrics[2].DataSource]}}" max="{{data[0][widget.metrics[1].DataSource]}}"></progress>
                    </div><br/>            
                    <div *ngIf="moreDetails && data && widget.metrics.length>3">
                        <div>{{widget.metrics[3].Name}}</div> 
                        <div>{{data[0][widget.metrics[3].DataSource]}}</div> 
                        <div class="col-sm-6">
                            <progress style="margin-left:-15px;" *ngIf="data" class="progress progress-xs progress-danger" value="{{data[0][widget.metrics[3].DataSource]}}" max="{{data[0][widget.metrics[1].DataSource]}}"></progress>
                        </div><br/>
                    </div>  
                    <div *ngIf="moreDetails && data" class="col-sm-9 ">
                        <button (click)="onMoreDetails()" type="button" class="btn btn-secondary pull-right">
                            <span class="glyphicons glyphicons-chevron-up"></span>                        
                        </button><br/><br/><br/>
                    </div>
                </div> 
                    <dadparameters [element]="widget" [editMode]="editMode" [onRefresh]="refreshMode" (parametersChanged)="changeData()"></dadparameters>   
                </div>

                <div *ngIf="data && widget.type===1" class="card-title m-l-5">{{widget.name}}</div>
                <div *ngIf="data && widget.type===1" class="content card card-secondary"> 
                    <div class="content card card-secondary"><br/><br/>
                        <dadchart [chart]="widget.chart" [data]="data"></dadchart>
                    </div>
                </div>  
                <dadparameters *ngIf="data && widget.type===1" [element]="widget" [editMode]="editMode" [onRefresh]="refreshMode" (parametersChanged)="changeData()"></dadparameters>
            </div>  
        </div>
     </div>
  </div>
</div>
  
   
  `
})

export class DadWidgetComponent implements OnInit {
  @Input()
  widget: DadWidget;
  @Input()
  page: DadPage;
  data;
  mapper: Mapper = new Mapper();
  editMode:boolean = false;
  moreDetails:boolean = false;
  refreshMode:boolean = false;
  intervalId: any;

    constructor(private dadWidgetDataService: DadElementDataService,
                private dadConfigService: DadConfigService,
                private router: Router, private route: ActivatedRoute) {}

    onRefresh():void{
        if (!this.refreshMode) this.refreshMode = true;
        else this.refreshMode = false;
    }

    addingZero(x:number):string{
        return (x <10 )? "0" + x : "" + x;
    }

    onEdit(message:string):void{
        if (!this.editMode) this.editMode = true;
        else this.editMode = false;
    }

    onRemoveFromPage():void{
        let new_widgets = [];
        let new_widgetids = [];
        for(let w=0; w< this.page.widgetids.length; w++){
            if (this.page.widgetids[w] !== this.widget.id){
                new_widgetids.push(this.page.widgetids[w]);
                new_widgets.push(this.page.widgets[w]);
            }
        }
        this.page.widgets = new_widgets;
        this.page.widgetids = new_widgetids;
        this.dadConfigService.saveOne(this.page);
    }

    onMoreDetails(message:string):void{
        if (!this.moreDetails) this.moreDetails = true;
        else this.moreDetails = false;
    }

    onDrill(message:string):void{
        //[routerLink]="['drillcharts', widget.drillTo ]"
        this.router.navigate(['drillcharts', this.widget.drillTo], { relativeTo: this.route});
    }

    onRawData(message:string):void{
            this.router.navigate(['table', this.data[0][this.widget.metrics[0].DataSource], this.widget.id, this.widget.tableId], { relativeTo: this.route});
    }

    changeData() {
    this.dadWidgetDataService.getElementData(this.widget).subscribe(
      data => {
        this.data = data;
          this.fixNullsInMetrics();
      }
    );
  }

    percentageOfTotal(){
      if(this.data[0][this.widget.metrics[0].DataSource] == 0){
          return 0;
      }
      else {
          let percentage = this.data[0][this.widget.metrics[0].DataSource] / this.data[0][this.widget.metrics[1].DataSource];
          return Math.floor(percentage * 100);
      }
    }

    fixNullsInMetrics(){
      if (!this.data || !this.widget.metrics) return;
      for( let i:number=0; i<this.widget.metrics.length; i++)
        if (this.data[0][this.widget.metrics[i].DataSource] === null) this.data[0][this.widget.metrics[i].DataSource] = 0;
    }

    realDataMonitoring() {
        if (this.widget.intervalRefreshOption === true) {
            let timeInterval = this.widget.intervalTime;
            this.intervalId = setInterval(() => {
                this.changeWidgetData();
            }, timeInterval);
        }
    }

    onRealDataMonitoring(): void {
        this.widget.intervalRefreshOption = !this.widget.intervalRefreshOption;
        this.realDataMonitoring();
        if(this.widget.intervalRefreshOption===false){this.ngOnDestroy()}
    }

    ngOnDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    changeWidgetData() {
        this.dadWidgetDataService.getElementData(this.widget).subscribe(
            data => {
                this.data = data;
            }
        )
    }


    ngOnInit() {
    console.log("Widgets are loading... :" + this.widget.id);
     // this.mapParameters2ui();

      if (!this.data && this.widget.data && config.testing){
          this.data = this.widget.data;
      }

      if (!config.testing) {
          this.dadWidgetDataService.getElementData(this.widget).subscribe(
              data => {
                  this.data = data;
                  if (this.data.errorMessage != null) {
                      alert(this.data.errorMessage);
                  }
                  this.fixNullsInMetrics();
              }
          )
      }
      this.realDataMonitoring();
  }
}
