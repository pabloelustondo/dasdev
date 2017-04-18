"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Created by pabloelustondo on 2016-11-21.
 */
var core_1 = require("@angular/core");
var sample_charts_1 = require("./sample.charts");
var sample_widgets_1 = require("./sample.widgets");
var sample_tables_1 = require("./sample.tables");
var sample_page_1 = require("./sample.page");
var _ = require("lodash");
var http_1 = require("@angular/http");
var appconfig_1 = require("./appconfig");
var angular2_jwt_1 = require("angular2-jwt");
var DadChartConfigsService = (function () {
    function DadChartConfigsService(http) {
        this.http = http;
        this.jwtHelper = new angular2_jwt_1.JwtHelper();
        if (appconfig_1.config.testing) {
            this.user = { username: "user", tenantid: "test", userid: "test-user" };
        }
        else {
            var token = localStorage.getItem('id_token');
            var u = this.jwtHelper.decodeToken(token);
            var username = u.username;
            var tenantid = u.tenantId;
            var userid = tenantid + "-" + username;
            this.user = { username: username, tenantid: tenantid, userid: userid };
        }
        localStorage.setItem('daduser', JSON.stringify(this.user));
    }
    DadChartConfigsService.prototype.getUserConfigurationFromDdb = function () {
        //this method will get the current configuration from server and store it in local storage
        var headers = new http_1.Headers({ 'Content-Type': 'application/json', 'x-access-token': this.token });
        var url = appconfig_1.config.dadback_url + "/daduser/" + this.user.userid;
        return this.http.get(url).toPromise();
    };
    DadChartConfigsService.prototype.saveUserConfigurationToDdb = function () {
        //this method will save the current configuration in local storage to the server
        var charts = localStorage.getItem("chartdata");
        var widgets = localStorage.getItem("widgetdata");
        var tables = localStorage.getItem("tabledata");
        var pages = localStorage.getItem("pagedata");
        var timeStamp = Date.now().toString();
        var daduserconfig = {
            userid: this.user.userid,
            username: this.user.username,
            tenantid: this.user.tenantid,
            config: { timeStamp: timeStamp,
                charts: charts,
                widgets: widgets,
                tables: tables,
                pages: pages }
        };
        var headers = new http_1.Headers({ 'Content-Type': 'application/json', 'x-access-token': this.token });
        var url = appconfig_1.config.dadback_url + "/daduser/" + daduserconfig.userid;
        this.http.post(url, daduserconfig).toPromise().then(function (res) {
            console.log('configuration saved' + JSON.stringify(res));
        })["catch"](function (error) {
            console.log('configuration failed to save');
        });
    };
    DadChartConfigsService.prototype.clearLocalCopy = function () {
        localStorage.removeItem("chartdata");
    };
    DadChartConfigsService.prototype.save = function (charts) {
        var charts_string = JSON.stringify(charts);
        localStorage.setItem("chartdata", charts_string);
        this.saveUserConfigurationToDdb();
    };
    DadChartConfigsService.prototype.saveOne = function (chart) {
        var _this = this;
        var charts;
        this.getChartConfigs().then(function (charts) {
            var chartIndex = _.findIndex(charts, function (w) { return w.id == chart.id; });
            if (chartIndex === -1) {
                charts.push(chart);
            }
            else {
                charts.splice(chartIndex, 1, chart);
            }
            _this.save(charts);
        });
    };
    DadChartConfigsService.prototype.getChartConfigs = function () {
        var _this = this;
        if (appconfig_1.config.testing) {
            localStorage.setItem("chartdata", JSON.stringify(sample_charts_1.CHARTS));
            return Promise.resolve(sample_charts_1.CHARTS);
        }
        var charts_string = localStorage.getItem("chartdata");
        if (charts_string != null) {
            var charts_obj = JSON.parse(charts_string);
            var DATA = charts_obj;
            return Promise.resolve(DATA);
        }
        else {
            return this.getUserConfigurationFromDdb().then(function (data) {
                _this.saveConfigFromDb(data);
                var chartsString = localStorage.getItem("chartdata");
                var charts = JSON.parse(chartsString);
                return Promise.resolve(charts);
            }, function (error) {
                console.log(error);
            });
        }
    };
    DadChartConfigsService.prototype.saveConfigFromDb = function (data) {
        var charts = data.config.charts;
        var widgets = data.config.widgets;
        var tables = data.config.tables;
        var pages = data.config.pages;
        localStorage.setItem("chartdata", JSON.stringify(charts));
        localStorage.setItem("widgetdata", JSON.stringify(widgets));
        localStorage.setItem("tabledata", JSON.stringify(tables));
        localStorage.setItem("pagedata", JSON.stringify(pages));
    };
    DadChartConfigsService.prototype.getChartConfig = function (id) {
        return this.getChartConfigs().then(function (charts) {
            var chartIndex = _.findIndex(charts, function (w) { return w.id == id; });
            return Promise.resolve(charts[chartIndex]);
        });
    };
    return DadChartConfigsService;
}());
DadChartConfigsService = __decorate([
    core_1.Injectable()
], DadChartConfigsService);
exports.DadChartConfigsService = DadChartConfigsService;
var DadWidgetConfigsService = (function () {
    function DadWidgetConfigsService(http) {
        this.http = http;
        this.jwtHelper = new angular2_jwt_1.JwtHelper();
        if (appconfig_1.config.testing) {
            this.user = { username: "user", tenantid: "test", userid: "test-user" };
        }
        else {
            var token = localStorage.getItem('id_token');
            var u = this.jwtHelper.decodeToken(token);
            var username = u.username;
            var tenantid = u.tenantId;
            var userid = tenantid + "-" + username;
            this.user = { username: username, tenantid: tenantid, userid: userid };
        }
        localStorage.setItem('daduser', JSON.stringify(this.user));
    }
    DadWidgetConfigsService.prototype.getUserConfigurationFromDdb = function () {
        //this method will get the current configuration from server and store it in local storage
        var headers = new http_1.Headers({ 'Content-Type': 'application/json', 'x-access-token': this.token });
        var url = appconfig_1.config.dadback_url + "/daduser/" + this.user.userid;
        return this.http.get(url).toPromise();
    };
    DadWidgetConfigsService.prototype.saveUserConfigurationToDdb = function () {
        //this method will save the current configuration in local storage to the server
        var charts = localStorage.getItem("chartdata");
        var widgets = localStorage.getItem("widgetdata");
        var tables = localStorage.getItem("tabledata");
        var pages = localStorage.getItem("pagedata");
        var timeStamp = Date.now().toString();
        var daduserconfig = {
            userid: this.user.userid,
            username: this.user.username,
            tenantid: this.user.tenantid,
            config: { timeStamp: timeStamp,
                charts: charts,
                widgets: widgets,
                tables: tables,
                pages: pages }
        };
        var headers = new http_1.Headers({ 'Content-Type': 'application/json', 'x-access-token': this.token });
        var url = appconfig_1.config.dadback_url + "/daduser/" + daduserconfig.userid;
        this.http.post(url, daduserconfig).toPromise().then(function (res) {
            console.log('configuration saved' + JSON.stringify(res));
        })["catch"](function (error) {
            console.log('configuration failed to save');
        });
    };
    DadWidgetConfigsService.prototype.saveConfigFromDb = function (data) {
        var charts = data.config.charts;
        var widgets = data.config.widgets;
        var tables = data.config.tables;
        var pages = data.config.pages;
        localStorage.setItem("chartdata", JSON.stringify(charts));
        localStorage.setItem("widgetdata", JSON.stringify(widgets));
        localStorage.setItem("tabledata", JSON.stringify(tables));
        localStorage.setItem("pagedata", JSON.stringify(pages));
    };
    DadWidgetConfigsService.prototype.clearLocalCopy = function () {
        localStorage.removeItem("widgetdata");
    };
    DadWidgetConfigsService.prototype.saveOne = function (widget) {
        var _this = this;
        var widgets;
        this.getWidgetConfigs().then(function (widgets) {
            var chartIndex = _.findIndex(widgets, function (w) { return w.id == widget.id; });
            if (chartIndex === -1) {
                widgets.push(widget);
            }
            else {
                widgets.splice(chartIndex, 1, widget);
            }
            _this.save(widgets);
        });
    };
    DadWidgetConfigsService.prototype.save = function (widgets) {
        var widgets_string = JSON.stringify(widgets);
        localStorage.setItem("widgetdata", widgets_string);
    };
    DadWidgetConfigsService.prototype.getWidgetConfig = function (id) {
        return this.getWidgetConfigs().then(function (widgets) {
            var widgetIndex = _.findIndex(widgets, function (w) { return w.id == id; });
            return Promise.resolve(widgets[widgetIndex]);
        });
    };
    DadWidgetConfigsService.prototype.getWidgetConfigs = function () {
        var _this = this;
        if (appconfig_1.config.testing) {
            localStorage.setItem("widgetdata", JSON.stringify(sample_widgets_1.WIDGETS));
            return Promise.resolve(sample_widgets_1.WIDGETS);
        }
        var widgets_string = localStorage.getItem("widgetdata");
        if (widgets_string != null) {
            var widgets_obj = JSON.parse(widgets_string);
            var DATA = widgets_obj;
            return Promise.resolve(DATA);
        }
        else {
            return this.getUserConfigurationFromDdb().then(function (data) {
                _this.saveConfigFromDb(data);
                var widgetsString = localStorage.getItem("widgetdata");
                var widgets = JSON.parse(widgetsString);
                return Promise.resolve(widgets);
            }, function (error) {
                console.log(error);
            });
        }
    };
    return DadWidgetConfigsService;
}());
DadWidgetConfigsService = __decorate([
    core_1.Injectable()
], DadWidgetConfigsService);
exports.DadWidgetConfigsService = DadWidgetConfigsService;
var DadTableConfigsService = (function () {
    function DadTableConfigsService() {
    }
    DadTableConfigsService.prototype.clearLocalCopy = function () {
        localStorage.removeItem("tabledata");
    };
    DadTableConfigsService.prototype.save = function (tables) {
        var tables_string = JSON.stringify(tables);
        localStorage.setItem("tabledata", tables_string);
    };
    DadTableConfigsService.prototype.saveOne = function (table) {
        var tables = this.getTableConfigs();
        var tableIndex = _.findIndex(tables, function (w) { return w.id == table.id; });
        if (tableIndex === -1) {
            tables.push(table);
        }
        else {
            tables.splice(tableIndex, 1, table);
        }
        this.save(tables);
    };
    DadTableConfigsService.prototype.getTableConfig = function (id) {
        var tables = this.getTableConfigs();
        var tableIndex = _.findIndex(tables, function (w) { return w.id == id; });
        return tables[tableIndex];
    };
    DadTableConfigsService.prototype.getTableConfigs = function () {
        if (appconfig_1.config.testing) {
            localStorage.setItem("tabledata", JSON.stringify(sample_tables_1.TABLES));
            return sample_tables_1.TABLES;
        }
        var tables_string = localStorage.getItem("tabledata");
        if (tables_string != null) {
            var table_obj = JSON.parse(tables_string);
            var DATA = table_obj;
            return DATA;
        }
        else {
            var tables_string_1 = JSON.stringify(sample_tables_1.TABLES);
            localStorage.setItem("tabledata", tables_string_1);
            return sample_tables_1.TABLES;
        }
    };
    return DadTableConfigsService;
}());
DadTableConfigsService = __decorate([
    core_1.Injectable()
], DadTableConfigsService);
exports.DadTableConfigsService = DadTableConfigsService;
var DadPageConfigsService = (function () {
    function DadPageConfigsService() {
    }
    DadPageConfigsService.prototype.clearLocalCopy = function () {
        localStorage.removeItem("pagedata");
    };
    DadPageConfigsService.prototype.save = function (pages) {
        var pages_string = JSON.stringify(pages);
        localStorage.setItem("pagedata", pages_string);
    };
    DadPageConfigsService.prototype.getPageConfig = function (id) {
        var pages = this.getPageConfigs();
        var pageIndex = _.findIndex(pages, function (w) { return w.id == id; });
        return pages[pageIndex];
    };
    DadPageConfigsService.prototype.getPageConfigs = function () {
        var pages_string = localStorage.getItem("pagedata");
        if (pages_string != null) {
            var page_obj = JSON.parse(pages_string);
            var DATA = page_obj;
            return DATA;
        }
        else {
            var pages_string_1 = JSON.stringify(sample_page_1.PAGES);
            localStorage.setItem("pagedata", pages_string_1);
            return sample_page_1.PAGES;
        }
    };
    return DadPageConfigsService;
}());
DadPageConfigsService = __decorate([
    core_1.Injectable()
], DadPageConfigsService);
exports.DadPageConfigsService = DadPageConfigsService;
