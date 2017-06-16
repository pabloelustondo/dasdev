"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var express = require("express");
var path = require("path");
var cors = require("cors");
var fs = require("fs");
var http = require("http");
var https = require("https");
var helmet = require("helmet");
var _ = require('lodash');
var config = require('./config.json');
var appconfig = require('./appconfig.json');
var rp = require("request-promise");
var app = express();
var mongodb = require('mongodb').MongoClient;
var rawDataLakeService_1 = require("./services/rawDataLakeService");
var databaseService_1 = require("./services/databaseService");
var projection_1 = require("./services/projection");
var dataService_1 = require("./services/dataService");
var globalconfig = require('./globalconfig.json');
var path = require('path');
var cors = require('cors');
globalconfig.hostname = "localhost"; //this can be overwritten by app config if necessary
//our app config will be the result of taking all global configurations and overwritting them with the local configurations
Object.keys(appconfig).forEach(function (key) {
    globalconfig[key] = appconfig[key];
});
globalconfig.port = globalconfig[globalconfig.id + "_url"].split(":")[2];
appconfig = globalconfig;
global.appconfig = appconfig;
console.log("configuration");
console.log(appconfig);
var kafka = require('kafka-node');
var ConsumerGroup = kafka.ConsumerGroup;
////////////////////////
// Express stuff
var db = new databaseService_1.DatabaseService(appconfig.ddb_address);
app.set('db', db);
app.use(bodyParser.json({ limit: '50mb' }));
app.use('/testing', express.static(path.join(__dirname + '/testing')));
app.use(bodyParser.json({
    type: function () {
        return true;
    },
    limit: '500mb'
}));
app.get('/test', function (req, res) {
    res.sendFile(path.join(__dirname + '/testing/spec/SpecRunner.html'));
});
app.get('/', function (req, res) {
    res.send("DPS");
});
app.use(helmet());
app.use(cors());
////////////////////////////
// CUSTOMER TENANT DATA API
////////////////////////////
// Puts a data point into a tenant datasets.
app.post('/data/request', function (req, res) {
    console.log('request came in');
    // send data to s3 without a lot of fuss
    var idaMetadata = req.body.idaMetadata;
    var clientMetadata = req.body.clientMetadata;
    if (!idaMetadata) {
        res.status(400).send('Missing idaMetadata field');
    }
    else if (!clientMetadata) {
        res.status(400).send('Missing clientMetadata field');
    }
    else {
        var tenantId = req.body.idaMetadata.tenantId;
        var dataSourceId = req.body.idaMetadata.dataSourceId;
        rawDataLakeService_1.uploadRawData(tenantId, dataSourceId, req.body).then(function (awsResponse) {
            console.log(awsResponse);
            res.status(200).send({
                status: 200,
                response: awsResponse
            });
        }, function (error) {
            console.log(error);
            res.status(500).send(error);
        });
        // massage and clean up data before sending to database layer
        var tenant_1 = db.getTenant(req.body.idaMetadata.tenantId);
        if (tenant_1) {
            var dataSource = _.find(tenant_1.dataSources, ['dataSourceId', req.body.idaMetadata.dataSourceId]);
            var projections = (!clientMetadata.projections) ? dataSource.metadata.projections : clientMetadata.projections;
            var dataSetId = (!clientMetadata.dataSetId) ? dataSource.metadata.dataSetId : clientMetadata.dataSetId;
            var collectionName_1 = dataSetId;
            projection_1.DataProjections(req.body.clientData, projections).then(function (data) {
                rawDataLakeService_1.uploadModifiedData(tenant_1.tenantId, collectionName_1, data).then(function (response) {
                    console.log('Final response' + JSON.stringify(response));
                }, function (error) {
                    console.log(error);
                });
            });
        }
    }
});
function publishTransactionLog(idaMetadata, clientMetadata, clientData) {
    var tenantId = idaMetadata.tenantId;
    var dataSourceId = idaMetadata.dataSourceId;
    rawDataLakeService_1.uploadRawData(tenantId, dataSourceId, clientData).then(function (awsResponse) {
        console.log(awsResponse);
    }, function (error) {
        console.log(error);
    });
}
//TODO refactor the name of the function, functionality stays the same
function processCleanedData(idaMetadata, clientMetadata, clientData) {
    var tenantId = idaMetadata.tenantId;
    var dataSourceId = idaMetadata.dataSourceId;
    //  console.log('tenantID ' + tenantId);
    //   console.log('dataSourceId ' + dataSourceId);
    // massage and clean up data before sending to database layer
    var db = app.get('db'); //get db
    var tenant = db.getTenant(idaMetadata.tenantId); //get the tenant for request
    if (tenant) {
        var dataSet = _.find(tenant['dataSets'], ['id', clientMetadata.dataSetId]); //get the dataSet for the request
        var projections = dataSet.projections; //get the projections
        console.log('projections \t ' + JSON.stringify(projections));
        var dataSetId = dataSet.id; //get the id
        var collectionName_2 = dataSetId;
        projection_1.DataProjections(clientData, projections).then(function (data) {
            rawDataLakeService_1.uploadModifiedData(tenant.tenantId, collectionName_2, data).then(function (response) {
                console.log('Final response' + JSON.stringify(response));
            }, function (error) {
                console.log(error);
            });
        });
    }
    else {
        console.log('tenantId not found');
    }
}
app.post('/data/outGoingRequest', function (req, res) {
    var metadata = req.body.metadata;
    var db = app.get('db');
    var tenant = db.getTenant('test');
    var dataSets = tenant.dataSets;
    if (metadata) {
        dataService_1.processRequest(metadata, dataSets, res);
    }
    else {
        res.status(400).send({
            message: 'No metadata field present in request body.'
        });
    }
});
app.get('/getMetadata/:tenantId', function (req, res) {
    var tenantId = req.params.tenantId;
    var db = app.get('db');
    var tenant = db.getTenant(tenantId);
    var dataSets = tenant.dataSets;
    res.status(200).send(dataSets);
});
exports.app = app;
if (config.useSSL) {
    var httpsOptions = {
        key: fs.readFileSync(config['https_key_location']),
        cert: fs.readFileSync(config['https_cert_location'])
    };
    var httpsServer = https.createServer(httpsOptions, app);
    httpsServer.listen(appconfig.port, function () {
        console.log('Starting https server.. https://localhost:' + appconfig.port + '/test');
    });
}
else {
    var httpServer = http.createServer(app);
    httpServer.listen(appconfig.port, function () {
        console.log('Starting no SSL http server.. http://localhost:' + appconfig.port + '/test');
        var db = dataService_1.getDbFromDataService();
        var headersOptions = {
            'x-api-key': 'kTq3Zu7OohN3R5H59g3Q4PU40Mzuy7J5sU030jPg'
        };
        var options = {
            json: true,
            method: 'get',
            headers: headersOptions,
            url: appconfig['ddb_url'] + '/tenants',
        };
        rp(options).then(function (data) {
            db.populateTenants(data);
        }).catch(function (err) {
            console.log(err);
        }).then(function () {
            var tenant = db.getTenant('test');
            console.log(JSON.stringify(tenant));
        }).then(function () {
            ////////////////////////////////
            // Kafka streaming topic     ///
            ////////////////////////////////
            // let kafkaClient = new kafka.Client(config.kafka_url);
            var dataSets = db.getAllDataSets();
            var topics = ['undefined_transactionLogs'];
            var consumerGroupOptions = {
                host: '127.0.0.1:2181',
                zk: undefined,
                batch: undefined,
                ssl: false,
                groupId: 'ExampleTestGroup',
                sessionTimeout: 15000,
                // An array of partition assignment protocols ordered by preference.
                // 'roundrobin' or 'range' string for built ins (see below to pass in custom assignment protocol)
                protocol: ['roundrobin'],
                // Offsets to use for new groups other options could be 'earliest' or 'none' (none will emit an error if no offsets were saved)
                // equivalent to Java client's auto.offset.reset
                fromOffset: 'earliest',
                // how to recover from OutOfRangeOffset error (where save offset is past server retention) accepts same value as fromOffset
                outOfRangeOffset: 'earliest',
                migrateHLC: false,
                migrateRolling: true
            };
            var consumerGroup = new ConsumerGroup(consumerGroupOptions, 'undefined_transactionLogs');
            consumerGroup.on('error', function (err) {
                console.log('error' + err);
            });
            consumerGroup.on('message', function (message) {
                try {
                    var data = JSON.parse(message.value);
                    var idaMetadata = data.idaMetadata;
                    var clientData = data.clientData;
                    var clientMetadata = data.clientMetadata;
                    console.log('json = ' + JSON.stringify(data));
                    publishTransactionLog(idaMetadata, clientMetadata, clientData);
                    processCleanedData(idaMetadata, clientMetadata, clientData);
                }
                catch (e) {
                    console.log('not json format' + message.value);
                }
                // console.log('message' + message);
            });
            /*            let payloads = [];
                        for (let dataSet of dataSets) {
                            payloads.push ({
                                topic : 'undefined_'+ dataSet.dataSet.id
                            });
                        }
            */
            /*let payloads =  [{ topic: 'undefined_transactionLogs' }];

            let options = { autoCommit: false};
            let kafkaOptions = { autoCommit: false};
            try {

                let consumer = new kafka.Consumer(kafkaClient, payloads, options);

                consumer.on('message', function (message: any) {
                    try {
                        let data = JSON.parse(message.value);

                        let idaMetadata = data.idaMetadata;
                        let clientData = data.clientData;
                        let clientMetadata = data.clientMetadata;

                        console.log('json = ' + JSON.stringify(data));

                      //  publishTransactionLog( idaMetadata, clientMetadata, clientData);
                      //  processCleanedData( idaMetadata, clientMetadata, clientData);
                    } catch (e) {
                        console.log('not json format' + message.value);
                    }
                });

                consumer.on('error', function (err: any) {

                    console.log('varun');
                    console.log(err);
                })

            } catch (e) {
                console.log('DPS could not communicate with kafka producer');
            }

*/
        });
        // continuously monitor mongodb for new tenant metadata; this can be updated with kafka streams later
        setInterval(function () {
            var headersOptions = {
                'x-api-key': 'kTq3Zu7OohN3R5H59g3Q4PU40Mzuy7J5sU030jPg'
            };
            var options = {
                json: true,
                method: 'get',
                headers: headersOptions,
                url: appconfig['ddb_url'] + '/tenants',
            };
            rp(options).then(function (data) {
                db.populateTenants(data);
            }).catch(function (err) {
                console.log(err);
            }).then(function () {
                var tenant = db.getTenant('test');
                //console.log(JSON.stringify(tenant));
            });
        }, 15000);
        //
    });
}
