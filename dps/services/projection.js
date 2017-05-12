"use strict";
/**
 * Created by vdave on 5/10/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var config = require('../config.json');
var appconfig = require('../appconfig.json');
function DataProjections(data, projections) {
    return new Promise(function (resolve, reject) {
        var _data = {};
        if (projections.length > 0 && projections[0] !== '') {
            projections.forEach(function (item, index) {
                _data[item] = data[item];
            });
        }
        else {
            _data = data;
        }
        resolve(_data);
    });
}
exports.DataProjections = DataProjections;
