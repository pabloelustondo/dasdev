/**
 * Created by pelustondo on 11/21/2016.
 */
import { Component, Input, OnInit  } from '@angular/core';
import { DadChartDataService } from './data.service'

declare var d3, nv: any;

export class DadChart {
    id: string;
    name: string;
    type: string; //this needs to be enum i think
    parameters: any[];
}

@Component({
    selector: 'dadchart',
    providers:[DadChartDataService],
    template: ` <!--  BEGIN CHART COMPONENT -->
 
    <table style="border:solid">
    <tr><td> <div (click)="onSelect(chart)">{{chart.name}} </div> </td></tr>
    <tr *ngIf="chart.parameters"><td> <span *ngFor="let p of chart.parameters"> {{p.parameterType}} - {{p.dateFrom}} - {{p.dateTo}}</span></td></tr>
    <tr>
        <td> <div style="height: 300px  "><svg [id]="chart.id"></svg></div> </td>
        <td>
            <div>Raw Data: 
              <div *ngIf="data">
                <div *ngFor ="let d of data.result">
                {{d.Rng}} -- {{d.NumberOfDevices}}
                </div>
              </div>
              <div *ngIf="!data">
                Data Not Available
              </div>
            </div>
        </td>
    </tr>     
    </table>
    <br/>
    <br/>
    <!--  END CHART COMPONENT -->`
})
export class DadChartComponent implements OnInit {
    @Input()
    chart: DadChart
    data;

    constructor(private dadChartDataService: DadChartDataService) { }


    drawChartDogaBar(chartConfig:DadChart, data){

        if (!data) return;
        var testdata = [];

        for(let r of data.result){
            testdata.push({"label":r.Rng,"value":r.NumberOfDevices});
        }

        const historicalBarChart = [
            {
                key: "Cumulative Return",
                values: testdata} ];

        var width = 300;
        var height = 300;

        nv.addGraph(function() {
            var chart = nv.models.discreteBarChart()
                    .x(function(d) { return d.label })
                    .y(function(d) { return d.value })
                    .staggerLabels(true)
                    //.staggerLabels(historicalBarChart[0].values.length > 8)
                    .showValues(true)
                    .duration(250)
                ;

            d3.select("#" + chartConfig.id)
                .datum(historicalBarChart)
                .call(chart);

            nv.utils.windowResize(chart.update);
            return chart;
        });

    }


    drawChartBar(chartConfig:DadChart, data){

        if (!data) return;
        var testdata = [];

        for(let r of data.result){
            testdata.push({"label":r.Rng,"value":r.NumberOfDevices});
        }

        const historicalBarChart = [
            {
                key: "Cumulative Return",
                values: testdata} ];

        var width = 300;
        var height = 300;

        nv.addGraph(function() {
            var chart = nv.models.discreteBarChart()
                    .x(function(d) { return d.label })
                    .y(function(d) { return d.value })
                    .staggerLabels(true)
                    //.staggerLabels(historicalBarChart[0].values.length > 8)
                    .showValues(true)
                    .duration(250)
                ;

            d3.select("#" + chartConfig.id)
                .datum(historicalBarChart)
                .call(chart);

            nv.utils.windowResize(chart.update);
            return chart;
        });

    }

    drawChart(chartConfig:DadChart, data) {

        if (chartConfig.type === 'pie') this.drawChartPie(chartConfig, data);
        if (chartConfig.type === 'bar') this.drawChartBar(chartConfig, data);
        if (chartConfig.type === 'bar') this.drawChartDogaBar(chartConfig, data);

    }

    drawChartPie(chartConfig:DadChart, data) {
            if (!data) return;
            var testdata = [];

            for(let r of data.result){
                testdata.push({"key":r.Rng,"y":r.NumberOfDevices});
            }

            var width = 300;
            var height = 300;

            nv.addGraph(function () {

                var d3Chart = nv.models.pie()
                        .x(function (d) {
                            return d.key;
                        })
                        .y(function (d) {
                            return d.y;
                        })
                        .width(width)
                        .height(height)
                        .labelType(function (d, i, values) {
                            return values.key + ':' + values.value;
                        })
                    ;

                console.log("CHART is actually drawing:" + "#" + chartConfig.id);
                d3.select("#" + chartConfig.id)
                    .datum([testdata])
                    .transition().duration(1200)
                    .attr('width', width)
                    .attr('height', height)
                    .call(d3Chart);

                return d3Chart;

            });
        };

    ngOnInit() {
        console.log("CHART starts drawing :" + this.chart.id);

        this.dadChartDataService.getChartData(this.chart).then(
            data => {
                this.data = data;
                this.drawChart(this.chart,this.data);
            }
        ).catch(err => console.log(err.toString()));


        /*
        this.dadChartDataService.getChartData().then(data => {
            this.dadDrawChart(this.chart,data);
        });
    */

    }
}

