/**
 * Created by pabloelustondo on 2016-11-19.
 */
import { Component, OnInit } from '@angular/core';
import { DadChart } from './chart.component';
import { DadChartConfigsService } from './chart.service';

declare var d3, nv: any;

@Component({
    selector: 'my-app',
    providers: [DadChartConfigsService],
    template: `

    <h1>{{title}}</h1>
       <!--  this is just for debugging to show the configuration of a specific chart. -->
    <div *ngIf="selectedChart">
     <div>Configuration Details for <b>{{selectedChart.name}}</b>  </div>
     <table>
     <tr>
     <td>id:</td>
     <td>name:</td></tr>
     <tr>
     <td>{{selectedChart.id}}</td>
     <td>{{selectedChart.name}}</td></tr>
     </table>
    </div>
    

    <h2>Charts</h2>
    <div class="chart" *ngFor="let chart of charts">
    <dadchart [chart]="chart"></dadchart>
    </div>

    `
})

export class AppComponent implements  OnInit{
    public title = 'DAD 0.0';
    public charts: DadChart[];
    public selectedChart:DadChart;
    public data;

    constructor(private dadChartConfigsService: DadChartConfigsService) { }

    onSelect(chart:DadChart):void {
        this.selectedChart = chart;
    }

 //   constructor(private _heroService: HeroService, private _router: Router) { }

    ngOnInit() {

        this.title = "DAD 0.0 - Angular 2.2 +  NVD3";
        console.log("APP  starts drawing all charts in dashboard:");

        this.charts = this.dadChartConfigsService.getChartConfigs();
    }

}

