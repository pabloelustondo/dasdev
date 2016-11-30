"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/**
 * Created by pelustondo on 11/21/2016.
 */
var core_1 = require('@angular/core');
var data_service_1 = require('./data.service');
var DadChart = (function () {
    function DadChart() {
    }
    return DadChart;
}());
exports.DadChart = DadChart;
var DadChartComponent = (function () {
    function DadChartComponent(dadChartDataService) {
        this.dadChartDataService = dadChartDataService;
    }
    DadChartComponent.prototype.drawChartDogaBar = function (chartConfig, data) {
        if (!data)
            return;
        var testdata = [];
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var r = data_1[_i];
            testdata.push({ "label": r.Rng, "value": r.NumberOfDevices });
        }
        var historicalBarChart = [
            {
                key: "Cumulative Return",
                values: testdata }];
        var width = 300;
        var height = 300;
        nv.addGraph(function () {
            var chart = nv.models.discreteBarChart()
                .x(function (d) { return d.label; })
                .y(function (d) { return d.value; })
                .staggerLabels(true)
                .showValues(true)
                .duration(250);
            d3.select("#" + chartConfig.id)
                .datum(historicalBarChart)
                .call(chart);
            nv.utils.windowResize(chart.update);
            return chart;
        });
    };
    DadChartComponent.prototype.drawChartBar = function (chartConfig, data) {
        if (!data)
            return;
        var testdata = [];
        for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
            var r = data_2[_i];
            testdata.push({ "label": r.Rng, "value": r.NumberOfDevices });
        }
        var historicalBarChart = [
            {
                key: "Cumulative Return",
                values: testdata }];
        var width = 300;
        var height = 300;
        nv.addGraph(function () {
            var chart = nv.models.discreteBarChart()
                .x(function (d) { return d.label; })
                .y(function (d) { return d.value; })
                .staggerLabels(true)
                .showValues(true)
                .duration(250);
            d3.select("#" + chartConfig.id)
                .datum(historicalBarChart)
                .call(chart);
            nv.utils.windowResize(chart.update);
            return chart;
        });
    };
    DadChartComponent.prototype.drawChart = function (chartConfig, data) {
        if (chartConfig.type === 'pie')
            this.drawChartPie(chartConfig, data);
        if (chartConfig.type === 'bar')
            this.drawChartBar(chartConfig, data);
        if (chartConfig.type === 'bar2')
            this.drawChartDogaBar(chartConfig, data);
        if (chartConfig.type === 'pie2')
            this.drawDogaChartPie(chartConfig, data);
    };
    DadChartComponent.prototype.drawChartPie = function (chartConfig, data) {
        if (!data)
            return;
        var testdata = [];
        for (var _i = 0, data_3 = data; _i < data_3.length; _i++) {
            var r = data_3[_i];
            testdata.push({ "key": r.Rng, "y": r.NumberOfDevices });
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
            });
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
    ;
    DadChartComponent.prototype.drawDogaChartPie = function (chartConfig, data) {
        if (!data)
            return;
        var testdata = [];
        for (var _i = 0, data_4 = data; _i < data_4.length; _i++) {
            var r = data_4[_i];
            testdata.push({ "key": r.Rng, "y": r.NumberOfDevices });
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
            });
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
    ;
    DadChartComponent.prototype.ngOnInit = function () {
        var _this = this;
        console.log("CHART starts drawing :" + this.chart.id);
        this.dadChartDataService.getChartData(this.chart).then(function (data) {
            _this.data = data.data;
            _this.drawChart(_this.chart, _this.data);
        }).catch(function (err) { return console.log(err.toString()); });
        /*
        this.dadChartDataService.getChartData().then(data => {
            this.dadDrawChart(this.chart,data);
        });
    */
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', DadChart)
    ], DadChartComponent.prototype, "chart", void 0);
    DadChartComponent = __decorate([
        core_1.Component({
            selector: 'dadchart',
            providers: [data_service_1.DadChartDataService],
            template: " <!--  BEGIN CHART COMPONENT -->\n \n    <table style=\"border:solid\">\n    <tr><td> <div (click)=\"onSelect(chart)\">{{chart.name}} </div> </td></tr>\n    <tr *ngIf=\"chart.parameters\"><td> <span *ngFor=\"let p of chart.parameters\"> {{p.parameterType}} - {{p.dateFrom}} - {{p.dateTo}}</span></td></tr>\n    <tr>\n        <td> <div style=\"height: 300px  \"><svg [id]=\"chart.id\"></svg></div> </td>\n        <td>\n            <div>Raw Data: \n              <div *ngIf=\"data\">\n                <div *ngFor =\"let d of data\">\n                {{d.Rng}} -- {{d.NumberOfDevices}}\n                </div>\n              </div>\n              <div *ngIf=\"!data\">\n                Data Not Available\n              </div>\n            </div>\n        </td>\n    </tr>     \n    </table>\n    <br/>\n    <br/>\n    <!--  END CHART COMPONENT -->"
        }), 
        __metadata('design:paramtypes', [data_service_1.DadChartDataService])
    ], DadChartComponent);
    return DadChartComponent;
}());
exports.DadChartComponent = DadChartComponent;
//# sourceMappingURL=chart.component.js.map