/**
 * Created by pablo elustodo on 12/14/2016.
 */
import { Component, Input, OnInit  } from '@angular/core';
import { DadChart } from "./chart.component";
import { DadTableDataService } from "./data.service";
import { Mapper, ChartData } from "./mapper";
import { DadDateRange } from "./dadmodels";
import { DadTableColumn, DadTableColumnType } from "./table.model"
import { DadChartComponent } from "./chart.component"
import { DadTableConfigsService } from './chart.service';
import { Router, ActivatedRoute} from '@angular/router';
import {Subscription } from 'rxjs';

export class DadTable {
  id: string;
  name: string;
  type?:string;
  parameters: any[];  //we are going to change this!
  endpoint :string;
  columns: DadTableColumn[];
  chart?: DadChart;
}

@Component({
  selector: 'dadtable',
  providers:[DadTableDataService,DadTableConfigsService],
  template: `     
    <div *ngIf="data">
        
        <div class="col-lg-10">
            <div class="card">
                <div class="card-header">
                    <i class="fa fa-align-justify"></i> {{table.name}}
                </div>
                <div class="card-block">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th style="text-align:center;" *ngFor="let col of table.columns" >{{col.Name}}</th>
                            </tr>  
                        </thead>
                        <tbody>
                            <tr *ngFor="let row of data; let rowindex = index">
                                <td style="align-content: center;" *ngFor="let col of table.columns">
                                    <span *ngIf="!isMiniChart(col)"> {{row[col.DataSource]}} </span>
                                    <span *ngIf="isMiniChart(col)"> 
                                        <dadchart [chart]="miniChart(col,rowindex)" [data]="chartData(row,col)"></dadchart>
                                    </span>        
                                </td>
                            </tr>
                        </tbody>
                    </table>
                
                <ul class="pagination">
                        <li *ngFor="let page of pages" class="page-item"><a class="page-link" (click)=refresh(page)>{{page}}</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
  <!-- to show chart in widgets, use the line below-->
  <!--<dadchart [chart]="widget.chart"></dadchart>-->

    <!--  END CHART COMPONENT --></div>`
})
export class DadTableComponent implements OnInit {
  @Input()
  table: DadTable;
  data: any;
  chartData(row,col){
    return JSON.parse(row[col.DataSource]);
  }
  count:number;
  private subscription: Subscription;
  pages:number[];

  constructor(private dadTableDataService: DadTableDataService,
              private dadTableConfigsService: DadTableConfigsService,
              private activatedRoute: ActivatedRoute
  ) { }

  isMiniChart(col:DadTableColumn){
    return col.Type == DadTableColumnType.MiniChart;
  }

  miniChart(col:DadTableColumn, rowindex:number){
    let chartConfig = JSON.parse(JSON.stringify(col.MiniChart)); //to clone object
    chartConfig.id += rowindex;
    return chartConfig;
  }

  refresh(page:number){

    this.table.parameters[0].rowsSkip = page * this.table.parameters[0].rowsTake;
    this.dadTableDataService.getTableData(this.table).then(
        data => {
          this.data = data.data;
        }
    ).catch(err => console.log(err.toString()));
  }



  ngAfterViewInit(){

    this.subscription = this.activatedRoute.params.subscribe(
        (param: any) => {
          this.count = Number(param['id']);
          console.log(this.count);
          let numberOfPages = this.count/this.table.parameters[0].rowsTake;
          this.pages = [];
          for(var i=0;i<numberOfPages;i++){ this.pages.push(i);};
        });
  }

  ngOnInit() {


    if (!this.table){
      let tables = this.dadTableConfigsService.getTableConfigs();
      this.table = tables[0]; //TO-DO we need to pass the ID as a router parameter
    }
    console.log("Tables are loading... :" + this.table.id);
    this.dadTableDataService.getTableData(this.table).then(
      data => {
        this.data = data.data;
      }
    ).catch(err => console.log(err.toString()));
  }
}