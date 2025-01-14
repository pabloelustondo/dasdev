/**
 * Created by pelustondo on 11/23/2016.
 */
"use strict";
var appconfig = require("../../../appconfig.json");
exports.config = {
    "testing": appconfig.testingmode,
    "dss_url": appconfig.dss_url,
    "oda_url": appconfig.oda_url,
    "dadback_url": appconfig.dadback_url,
    "authorizationserver": appconfig.dss_url,
    "InitialChargeLevels": appconfig.oda_url + "/Devices/Battery/Summary/InitialChargeLevels",
    "DischargeRate": appconfig.oda_url + "/Devices/Battery/Summary/DischargeRate",
    "DevicesNotSurvivedShift": appconfig.oda_url + "/Devices/Battery/Summary/countOfDevicesDidNotSurviveShift",
    "ListOfDevicesNotSurvivedShift": appconfig.oda_url + "/Devices/Battery/List/DevicesDidNotSurviveShift",
    "BatteryMetrics": { url: appconfig.oda_url + "/Devices/Battery/getMetrics", method: "post" },
    "AverageDischargeRate": appconfig.oda_url + "/Devices/Battery/Summary/AverageDischargeRate",
    "ApplicationDeploymentCount": appconfig.oda_url + "/Devices/Application/executionTime",
    "NumberOfInstallations": appconfig.oda_url + "/Devices/Application/numberOfInstallations",
    "GetLocation": appconfig.oda_url + "/Vehicles/Data/GetLocations"
};
