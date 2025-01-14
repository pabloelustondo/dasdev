"use strict";
var transformer_1 = require("./transformer");
var reducer_1 = require("./reducer");
var filter_1 = require("./filter");
var search_1 = require("./search");
var ChartData = (function () {
    function ChartData() {
        this.Dimension = [];
        this.Metric = [];
    }
    return ChartData;
}());
exports.ChartData = ChartData;
var Mapper = (function () {
    function Mapper() {
    }
    Mapper.prototype.map = function (config, data) {
        var chartData = new ChartData();
        var dataForChart;
        var index = 0;
        if (config.newFilter) {
            var filter = new filter_1.DadFilter();
            data = filter.filter(config, data);
        }
        if (config.alert) {
            var search = new search_1.DadSearch();
            var alertResult = search.alertExpression(config, data);
            if (alertResult)
                alert("warning warning : " + config.alert.expression);
        }
        if (config.reduction) {
            var reducer = new reducer_1.DadReducer();
            data = reducer.reduce(config, data);
        }
        var configa;
        var configb;
        if (!config.a && !config.b && !config.lat && !config.lon) {
            configa = "a";
            configb = "b";
            chartData.Metric.push(configa);
            chartData.Dimension.push(configb);
            data.forEach(function (e) {
                chartData.Dimension.push(e);
                chartData.Metric.push(e);
            });
        }
        else if (config.lon && config.lat && !config.a && !config.b) {
            chartData.Metric.push('lon');
            chartData.Dimension.push('lat');
            var mapData = data;
            mapData.forEach(function (e) {
                chartData.Dimension.push(e['lat']);
                chartData.Metric.push(e['lon']);
            });
        }
        else {
            configa = config.a;
            configb = config.b;
            chartData.Metric.push(configa);
            chartData.Dimension.push(configb);
            data.forEach(function (e) {
                chartData.Dimension.push(e[configb]);
                chartData.Metric.push(e[configa]);
            });
        }
        if (config.type === 'bar' || config.type === 'spline') {
            dataForChart = {
                x: config.b,
                columns: [chartData.Dimension, chartData.Metric],
                type: config.type
            };
        }
        if (config.type === 'pie') {
            dataForChart = {
                columns: [],
                type: config.type
            };
            for (var i = 1; i < chartData.Dimension.length; i++) {
                dataForChart.columns.push([chartData.Dimension[i], chartData.Metric[i]]);
            }
        }
        if (config.type === 'map' || config.type === 'map2') {
            dataForChart = {
                columns: [],
                type: config.type
            };
            for (var i = 1; i < chartData.Dimension.length; i++) {
                dataForChart.columns.push([parseFloat(chartData.Dimension[i]), parseFloat(chartData.Metric[i])]);
            }
        }
        var transformer = new transformer_1.DadTransformer();
        config.mappedData = transformer.transformAll(config, dataForChart);
        return config.mappedData;
    };
    return Mapper;
}());
exports.Mapper = Mapper;
