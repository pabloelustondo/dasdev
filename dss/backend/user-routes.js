var express = require('express'),
    _       = require('lodash'),
    config  = require('./config'),
    appconfig  = global.appconfig,
    jwt     = require('jsonwebtoken');

require('./error-messages.js');
var querystring = require('querystring');
var https = require('https');
var uuid = require('node-uuid');
var kafka = require('kafka-node');
var request = require('request');
var LocalStorage = require('node-localstorage').LocalStorage;
var NextBusHelper = require ('./DataSourceHelpers/NextBusHelper');
localStorage = new LocalStorage('./temp');
var process = require('process');
var app = module.exports = express.Router();

var idaInformation = config.idaInformation;
idaInformation.url = appconfig.ida_url;

var SOTITenant =
  {
    accountid: "soti",
    mcurl: appconfig.dssback_url,
    apikey:"112233445511223344",
    domainid: "soti",
    username: "admin",
    tenantId: "soti",
    companyname: "soti",
    companyaddress: "SotiAddress",
    companyphone: "SotiPhone"
  };

var TestTenant =
  {
    accountid: "test",
    mcurl: appconfig.dssback_url,
    apikey:"112233445511223344",
    domainid: "test",
    username: "admin",
    tenantId: "test",
    companyname: "test",
    companyaddress: "companyAddress",
    companyphone: "111 111 1111"
  };

var Producer = kafka.Producer, KeyedMessage = kafka.KeyedMessage, client = new kafka.Client(), producer = new Producer(client), km = new KeyedMessage('key', 'message');
producer.on('ready', function () { });
producer.on('error', function (err) {
  console.log('error: ' + err);
});

var enrollments = [SOTITenant, TestTenant];

function createToken(user) {
  return jwt.sign(_.omit(user, 'password'), config.secret, { expiresIn: config['agentPermTokenExpiryTime'] });
}

function readToken(token, callback) {  //Bearer
  try{
    jwt.verify(token, config.secret,callback);

  } catch(e){
    console.log(e);
  }
}

app.get('/api/enrollments', function(req, res){
  //var message: logging = {"classifier":"Create_Success", "serverId": process.pid.toString(), "priority": "Critical", "producer": "DDB", "message": "The {{speed}} {{fox.color}} {{mammal[2]}} jumped over the lazy {{mammal[0]}}", "params": { "speed": "quick", "fox": { "color": "brown" }, "mammal": ["dog", "cat", "fox"] } };
  log_action('Read_Success', "Getting all enrollments", "Info", "", "", function(){ res.status(200).send(enrollments)});
});

app.get('/enrollments2', function(req, res) {
  var d = new Date();
  res.status(200).send('Hi from the DSS Anonymous Route at + ' + d.toISOString());
});

app.post('/resetCredentials/:agentId', function (req, res) {

  var _header = req.body.headers;
  var _token = _header['x-access-token'];
  var agentId = req.params.agentId;
  var token = _token[0];
  try{
    jwt.verify(token, config.secret, function (err, success) {
      if (err) {
        return res.status(400).send (ErrorMsg.token_verification_failed);
      }
      if (success) {
        var newActivationKey = uuid.v4();
        request({
          rejectUnauthorized: false,
          url: appconfig.ddb_url + "/updateDataSourceCredentials",
          method: 'post', //Specify the method
          headers: { //We can define headers too
            'Content-Type': 'application/json'
          },
          json : {
            'agentId' : agentId,
            'activationKey': newActivationKey
          }
        }, function(error, response, body){
          if(error) {
            console.log(error);
            res.status(400).send(ErrorMsg.mcurl_enrollement_failed_url_not_reachable);
          } else {
            console.log(response.statusCode, body);

            if (response.statusCode === 200){
              log_action("Update_Success", "Credentials reset for agent {{agentId}}" ,"Info", success.tenantId, '{ "agentId": '+agentId+'}', function (err, data) {
                res.status(200).send({
                  message: "Successfully reset"
                });
              });
            } else if (response.statusCode === 404) {
              res.status(404).send(ErrorMsg.token_verification_failed);
            }
            else {
              res.status(400).send(ErrorMsg.mcurl_enrollement_failed_authentication);
            }
          }
        });

      }
    });
  }
  catch (e) {
      console.log(e);
      return res.status(400).send (ErrorMsg.token_verification_failed);
    }
});

//

app.get('/activationKey/:tenantId/:dataSourceId', function (req, res) {


  var payload = {
    tenantId : req.params.tenantId,
    dataSourceId : req.params.dataSourceId,
    ida : config['idaInformation']
  };
  var t = jwt.sign(payload, config['secret'], {expiresIn: config.agentPermTokenExpiryTime});
  console.log(t);
  res.status(200).send({
    token : t
  });
});

app.get('/getAgentToken', function(req, res) {
  var _header = req.headers;
  var token = _header['x-access-token'];

  if(!token){
    return res.status(400).send ( ErrorMsg.login_failed_authentication);
  }

  try{
    jwt.verify(token, config.secret, function (err, success) {
      if (err) {
        return res.status(400).send (ErrorMsg.token_verification_failed);
      }
      if (success) {
        var _tenantID = success.tenantId;
        var _agentID = success.agentId;
        var _activationKey = success.activationKey;

        request({
          rejectUnauthorized: false,
          url: appconfig.ddb_url + "/verifyDataSource",
          method: 'GET', //Specify the method
          headers: { //We can define headers too
            'Content-Type': 'application/json'
          },
          qs: {tenantId:_tenantID, agentId : _agentID, activationKeys: _activationKey }
        }, function(error, response, body){
          if(error) {
            console.log(error);
            res.status(400).send(ErrorMsg.mcurl_enrollement_failed_url_not_reachable);
          } else {
            console.log(response.statusCode, body);

            if (response.statusCode === 200){

              var body = JSON.parse(response.body);
              if (body.activationKey === _activationKey) {

                idaInformation.url = appconfig.ida_url;

                var new_token = jwt.sign({
                  agentid: body.agentId,
                  tenantid: _tenantID,
                  idaInformation: idaInformation
                }, config.expiringSecret, {expiresIn: config.tempTokenExpiryTime});
                console.log(new_token);
                res.status(200).send({
                  session_token: new_token
                });
              } else {
                res.status(404).send(ErrorMsg.token_activationKey_failed)
              }

            } else if (response.statusCode === 404) {
              res.status(404).send(ErrorMsg.token_verification_failed);
            }
            else {
              res.status(400).send(ErrorMsg.mcurl_enrollement_failed_authentication);
            }
          }
        });

      }
    });

  }
  catch (e) {
    console.log(e);
    return res.status(400).send (ErrorMsg.token_verification_failed);
  }
});


app.get('/sourceCredentials/:agentId', function (req, res) {
  var _header = req.headers;
  var agentId = req.params.agentId;
  var token = _header['x-access-token'];


  try{
    jwt.verify(token, config.secret, function (err, success) {
      if (err) {
        return res.status(400).send (ErrorMsg.token_verification_failed);
      }
      if (success) {
        request({
          rejectUnauthorized: false,
          url: appconfig.ddb_url + "/dataSource/"+ agentId,
          method: 'GET', //Specify the method
          headers: { //We can define headers too
            'Content-Type': 'application/json'
          }
        }, function(error, response, body){
          if(error) {
            console.log(error);
            res.status(400).send(ErrorMsg.mcurl_enrollement_failed_url_not_reachable);
          } else {
            console.log(response.statusCode, body);

            if (response.statusCode === 200){

              tokenpayload = {};

              var body = JSON.parse(response.body);

              tokenpayload.accountId =  success.accountid;
              tokenpayload.tenantId =  success.tenantId;
              tokenpayload.agentId = agentId;
              tokenpayload.activationKey =  body[0].activationKey;
              tokenpayload.idaInformation = idaInformation;
              var _token = createToken(tokenpayload);

              res.status(200).send(_token);

            } else if (response.statusCode === 404) {
              res.status(404).send(ErrorMsg.token_verification_failed);
            }
            else {
              res.status(400).send(ErrorMsg.mcurl_enrollement_failed_authentication);
            }
          }
        });

      }
    });

  }
  catch (e) {
    console.log(e);
    return res.status(400).send (ErrorMsg.token_verification_failed);
  }
});

function enrollDlmDataSource (dataSource, callback){


  var tempToken = jwt.sign({
    agentid: dataSource.agentId,
    tenantid:  dataSource.tenantId,
    idaInformation: idaInformation
  }, config.expiringSecret, {expiresIn: config.tempTokenExpiryTime});
  // map UI input to server input
  var data = {
    dataSourceId : dataSource.agentId,
    method : 'GET',
    url : dataSource.dataSourceData[1].inputValue,
    expiringToken : tempToken,
    name : dataSource.dataSourceData[0].inputValue,
    interval : dataSource.dataSourceData[2].inputValue,
    tenantId : dataSource.tenantId,
    status : 'active'
  };

  request({ rejectUnauthorized: false,
    url: config.dlmEndpointUrl + "/newUrlConfig",
    json : data,
    method: 'POST', //Specify the method
    headers: { //We can define headers too
    'Content-Type': 'application/json'
  }
}, function(error, response, body) {
      if (error) {
        console.log(error);
        callback({
          status: 400,
          message : ErrorMsg.dlm_generic_error
        });
       //  res.status(400).send(ErrorMsg.dlm_generic_error);
      } else {
        console.log(response.statusCode, body);
        if (response.statusCode === 200) {
          registerDataSourceHelper(dataSource, callback)
        } else {
          callback({
            status: 400,
            message : ErrorMsg.mcurl_enrollement_failed_authentication
          });
          // res.status(400).send(ErrorMsg.mcurl_enrollement_failed_authentication);
        }
      }
    }
  );
}


function registerDataSourceHelper (dataSource, callback) {

  request({
    rejectUnauthorized: false,
    url: appconfig.ddb_url + "/insertNewDataSource",
    json : dataSource,
    method: 'POST', //Specify the method
    headers: { //We can define headers too
      'Content-Type': 'application/json'
    }
  }, function(error, response, body){
    if(error) {
      console.log(error);
      // res.status(400).send(ErrorMsg.mcurl_enrollement_failed_url_not_reachable);
      var e = {
        status : 400,
        message : ErrorMsg.mcurl_enrollement_failed_url_not_reachable
      };
      callback(e, null);
    } else {
      console.log(response.statusCode, body);

      if (response.statusCode === 200){
        callback(null, {
          status: 200,
          message: 'added successfully'
        });

      } else {

        callback({
          status : 400,
          message : ErrorMsg.mcurl_enrollement_failed_authentication
        }, null);
      }
    }
  });

}
app.post('/registerDataSource', function (req, res) {

  // determine data source type

  var dataSourceType = req.body.dataSourceType;
  var dataSourceData = req.body.data;

  // map data Source properties to data

  if (!req.body.agentid) {
    return res.status(400).send( ErrorMsg.missing_apikey );
  }
  if (!req.body.tenantid) {
    return res.status(400).send( ErrorMsg.missing_domainid );
  }
  if (!req.body.dataSourceType) {
    return res.status(400).send( ErrorMsg.missing_dataSourceType );
  }


  var activationKey = uuid.v4();
  var dataSource = {
    tenantId: req.body.tenantid,
    agentId: uuid.v4(),
    dataSourceType : dataSourceType,
    dataSourceData : dataSourceData,
    mcurl: req.body.mcurl,
    activationKey: activationKey,
    status : 'active'
  };

  if (dataSourceType === 'NextBus'){
    enrollDlmDataSource(dataSource, function (err, result){
        if (err){
          res.status(err.status).send(err.message);
        }
        if (result) {
          log_action("Create_Success", "Data source created {{dataSource}}",  "INFO", req.body.tenantid,'{"dataSource" : '+JSON.stringify(dataSource)+'}',function (err, data) {
            res.status(result.status).send(result.message);
          });
        }
      });
  }
  else {
    registerDataSourceHelper(dataSource, function (err, result){
      if (err){
        res.status(err.status).send(err.message);
      }
      if (result) {
       log_action("Create_Success", "Data source created {{dataSource}}",  "INFO", req.body.tenantid,'{"dataSource" : '+JSON.stringify(dataSource)+'}',function (err, data) {
          res.status(result.status).send(result.message);
        });
      }
    });
  }

});

app.get('/getDataSources', function(req, res) {
   var _header = req.headers;
   var token = _header['x-access-token'];

   if(!token){
     return res.status(400).send ( ErrorMsg.login_failed_authentication);
   }

   try{
     jwt.verify(token, config.secret, function (err, success) {
       if (err) {
         return res.status(400).send (ErrorMsg.token_verification_failed);
       }
       if (success) {
         var _tenantID = success.tenantId;

         request({
           rejectUnauthorized: false,
           url: appconfig.ddb_url + "/dataSources/"+ success.tenantId,
           method: 'GET', //Specify the method
           headers: { //We can define headers too
             'Content-Type': 'application/json'
           },
           qs: {tenantId:_tenantID}
         }, function(error, response, body){
           if(error) {
             console.log(error);
             res.status(400).send(ErrorMsg.mcurl_enrollement_failed_url_not_reachable);
           } else {
             console.log(response.statusCode, body);

             if (response.statusCode === 200){

               var body = JSON.parse(response.body);
               res.status(200).send(body);

             } else if (response.statusCode === 404) {
               res.status(404).send(ErrorMsg.token_verification_failed);
             }
             else {
               res.status(400).send(ErrorMsg.mcurl_enrollement_failed_authentication);
             }
           }
         });

       }
     });
   }
   catch (e) {
     console.log(e);
     return res.status(400).send (ErrorMsg.token_verification_failed);
   }
});

app.post('/enrollments', function(req, res) {
//////// Parameters Checking /////////
  //////// Parameters Checking /////////
  if (!req.body.accountid) {
    return res.status(400).send( ErrorMsg.missing_accountid );
  }
  if (!req.body.mcurl) {
    return res.status(400).send( ErrorMsg.missing_mcurl );
  }
  if (!req.body.apikey) {
    return res.status(400).send( ErrorMsg.missing_apikey );
  }
  if (!req.body.domainid) {
    return res.status(400).send( ErrorMsg.missing_domainid );
  }
  if (!req.body.username) {
    return res.status(400).send( ErrorMsg.missing_username );
  }
  if (!req.body.password) {
    return res.status(400).send( ErrorMsg.missing_password );
  }
//////////////////////////////////////////////////

  var _tenantID = req.body.domainid;

  try {

    // check if a tenant with provided id is already registed
    request({
      rejectUnauthorized: false,
      url: appconfig.ddb_url + "/getEnrollment",
      method: 'GET', //Specify the method
      headers: { //We can define headers too
        'Content-Type': 'application/json'
      },
      qs: {tenantId: _tenantID}
    }, function (error, response, body) {
      if (error) {
        console.log(error);
        res.status(400).send(ErrorMsg.mcurl_enrollement_failed_url_not_reachable);
      } else {
        if (response.statusCode === 404 && response.statusMessage === 'Not Found') {
          // try to verify the user with MobiControl instance by making an api call to MC instance
          var encodeString = req.body.apikey+':'+req.body.clientsecret;
          var apiClientSecretBuffer =  new Buffer(encodeString);
          var encodedBase64ApiClientSecret = apiClientSecretBuffer.toString('base64');
          //AT THIS POINT WE KNOW THAT TENANT IS NOT REGISTERED AND NOW WE WANT TO AKS HIM TO LOG IN
          request({
            rejectUnauthorized: false,
            url: req.body.mcurl + "/api/token",
            method: 'POST', //Specify the method
            headers: { //We can define headers too
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': "Basic " + encodedBase64ApiClientSecret
            },
            body: "grant_type=password&username=" + req.body.username + "&password=" + req.body.password
          }, function (error, response, body) {
            if (error) {
              console.log(error);
              res.status(404).send(ErrorMsg.mcurl_enrollement_failed_url_not_reachable);
            } else if (response.statusCode === 400 ) {
                res.status(400).send(ErrorMsg.mcurl_enrollement_failed_authentication);
            } else if ( response.statusCode === 404 && response.statusMessage === 'Lala' ) {
                res.status(404).send(ErrorMsg.mcurl_enrollement_failed_url_not_reachable);
            }
            else {
              console.log(response.statusCode, body);
             //YES!, WE GOT THE TOKEN BACK SO THE USER IS AUTHORIZED ... NOW WE ARE GOING TO SAVE TO DB
             // if (response.statusCode === 200) {
                request({
                  rejectUnauthorized: false,
                  url: appconfig.ddb_url + "/newEnrollment",
                  json: {
                    'accountId': req.body.accountid,
                    'mcurl': req.body.mcurl,
                    'tenantId': req.body.domainid,
                    'domainId': req.body.domainid,
                    'Status': 'new',
                    "clientid": req.body.apikey,
                    "clientsecret": encodedBase64ApiClientSecret,
                    "companyName": req.body.companyName,
                    "companyAddress": req.body.companyAddress,
                    "companyPhone": req.body.companyPhone
                  },
                  method: 'POST', //Specify the method
                  headers: { //We can define headers too
                    'Content-Type': 'application/json'
                  }

                }, function (error, response, body) {
                  if (error) {
                    console.log(error);
                    res.status(400).send(ErrorMsg.mcurl_enrollement_failed_url_not_reachable);
                  } else {

                    tokenpayload = {};
                    tokenpayload.username = req.body.username;
                    tokenpayload.accountid = req.body.accountid;
                    tokenpayload.domainid = req.body.username;
                    tokenpayload.tenantId = req.body.domainid;
                    tokenpayload.companyname = req.body.companyName;
                    tokenpayload.companyaddress = req.body.companyAddress;
                    tokenpayload.companyphone = req.body.companyPhone;

                    var token = createToken(tokenpayload);
                    var tenantInfo = {
                      'accountId': req.body.accountid,
                      'mcurl': req.body.mcurl,
                      'tenantId': req.body.domainid,
                      'domainId': req.body.domainid,
                      'Status': 'new',
                      "clientid": req.body.apikey,
                      "clientsecret": encodedBase64ApiClientSecret,
                      "companyName": req.body.companyName,
                      "companyAddress": req.body.companyAddress,
                      "companyPhone": req.body.companyPhone
                    };
                    enrollments.push(tenantInfo);

                    sendEmail2(tokenpayload, token);
                    log_action("Create_Success", "New tenant enrolled {{tenantInfo}}",  "INFO", tenantInfo.tenantId,'{"tenantInfo" : '+JSON.stringify(tenantInfo)+'}', function (err, data) {
                      res.status(200).send({
                        id_token: token
                      });
                    });
                  }
                });
            }
          });
        } else {

          if (response.statusCode === 200){
            res.status(400).send(ErrorMsg.domainid_already_enrolled);}
          else {
            res.status(500).send(ErrorMsg.system_error);
          }

        }
      }
    });
  } catch (e)  {
    res.status(500).send({});
  }

});

app.post('/delete_test_domains', function(req, res) {
   _.remove(enrollments, function(enrollment){ return (enrollment.domainid === "utest");} );
   //need to remove test domains in database

  request({
    rejectUnauthorized: false,
    url: appconfig.ddb_url + "/testenrollments",
    method: 'DELETE', //Specify the method
    headers: { //We can define headers too
      'Content-Type': 'application/json'
    }
  }, function (error, response, body) {
    if (error){
      console.log("FAILED TO DELETE TEST ENROLLMENTS");
      };
  });
  return res.status(200).send({});
});

app.get('/delete_all', function(req, res) {   //for now for testing...
  enrollments = [SotiAdminAccount];
  res.status(200).send({});
});

app.get('/delete_all_mine', function(req, res) {   //for now for testing...

  var rawToken = req.get('authorization').substr(7);
  var jwt = readToken( rawToken, function(err,decoded){
    enrollments = _.filter(enrollments, function(e){return e.accountid !== decoded.accountid;} );
    res.status(200).send({});
  });
});

app.get('/api/myenrollments', function(req, res){

  var _header = req.headers;
  var token = _header['x-access-token'];

  if(!token){
    return res.status(400).send ( ErrorMsg.login_failed_authentication);
  }

  try{
    jwt.verify(token, config.secret, function (err, success) {
      if (err) {
        return res.status(400).send (ErrorMsg.token_verification_failed);
      }
      if (success) {
        var _tenantID = success.tenantId;

        request({
          rejectUnauthorized: false,
          url: appconfig.ddb_url + "/getEnrollment",
          method: 'GET', //Specify the method
          headers: { //We can define headers too
            'Content-Type': 'application/json'
          },
          qs: {tenantId : _tenantID}
        }, function(error, response, body){
          if(error) {
            console.log(error);
            res.status(400).send(ErrorMsg.mcurl_enrollement_failed_url_not_reachable);
          } else {
            console.log(response.statusCode, body);

            if (response.statusCode === 200){

              var body = JSON.parse(response.body);

              var responseBody = {
                status : body.Status,
                tenantid : body.tenantId,
                mcurl : body.mcurl,
                domainid : body.accountId,
                username : body.accountId
              };
                res.status(200).send(responseBody);

            } else if (response.statusCode === 404) {
              res.status(404).send(ErrorMsg.token_verification_failed);
            }
            else {
              res.status(400).send(ErrorMsg.mcurl_enrollement_failed_authentication);
            }
          }
        });

      }
    });

  }
  catch (e) {
    console.log(e);
    return res.status(400).send (ErrorMsg.token_verification_failed);
  }



});

app.get('/confirm', function(req, res){
  try{
    var token = req.query.token;
  readToken(token, function(err,decoded){
    if (err)  res.sendfile('./public/failure.html');
    var e = [];
    e = _.findIndex(enrollments, function(e){return e.domainid === decoded.domainid;} );
    if (e > 0) {  //if not found findIndex returns -1
      enrollments[e].status = "confirmed";
      return res.sendfile('./public/thanks.html');
    } else {
      res.sendfile('./public/doesnotexist.html');
    }
  });
  }catch(e){
    res.sendfile('./public/failure.html');
  }
});

app.post('/deleteDataSource', function (req, res) {

  var token = req.headers['x-access-token'];
  var tenantId = '';
  var agentId = '';
  if(!token){
    return res.status(400).send ( ErrorMsg.login_failed_authentication);
  }
  else {
    try{
      jwt.verify(token, config.secret, function (err, success) {
        if (err) {
          return res.status(400).send (ErrorMsg.token_verification_failed);
        }
        if (success) {
          tenantId = success.tenantId;

          if (req.body.dataSourceType === 'NextBus') {
            NextBusHelper.deleteDataSource(req, function (err, result){
              if (err){
                res.status(500).send('Invalid request, could not delete');
              }
              else {
                var requestData = {
                  queryParams :  {
                    tenantId: _tenantID,
                    agentId: req.body.agentid
                  },
                  method : 'Delete',
                  url : appconfig.ddb_url + '/deleteDataSource',
                  headers : { //We can define headers too
                    'Content-Type': 'application/json'
                  }
                };

                httpRequest(req, requestData, function (error, response) {
                    if (error) {
                      res.status(error.status).send('Error deleting from DSS source');
                    }
                    if (response) {
                      res.status(response.status).send(response.body);
                    }
                } )
              }
            });
          } else {

            var _tenantID = success.tenantId;

            request({
              rejectUnauthorized: false,
              url: appconfig.ddb_url + '/deleteDataSource',
              method: 'Delete', //Specify the method
              headers: { //We can define headers too
                'Content-Type': 'application/json'
              },
              qs: {
                tenantId: _tenantID,
                agentId: req.body.agentid
              }
            }, function (error, response, body) {
              if (error) {
                console.log(error);
                res.status(400).send('Error in deleteing data source with database server error');
              } else {
                console.log(response.statusCode, body);

                if (response.statusCode === 200) {
                  log_action("Delete_Success", "Data source deleted for {{agentId}}",  "INFO", _tenantID,'{"agentId" : '+req.body.agentid+'}', function (err, data) {
                    var body = JSON.parse(response.body);
                    res.status(200).send(body);
                  });
                } else if (response.statusCode === 404) {
                  res.status(404).send('Error with query and data source');
                }
                else {
                  res.status(400).send('Error with token');
                }
              }
            });
          }

        }
      });

    }
    catch (e) {
      console.log(e);
      return res.status(400).send (ErrorMsg.token_verification_failed);
    }
  }
});

function httpRequest(req, data, callback) {
  request({
    rejectUnauthorized: false,
    url: data.url,
    method: data.method, //Specify the method
    headers: data.headers,
    qs: data.queryParams
  }, function(error, response, body) {
    if (error) {
      console.log(error);
      callback({
        status: 400
      }, null);
      //res.status(400).send('Error in deleteing data source with database server error');
    } else {
      console.log(response.statusCode, body);

      if (response.statusCode === 200) {

        var body = JSON.parse(response.body);
        callback(null, {
          status: response.statusCode,
          body: body
        });
        // res.status(200).send(body);

      }
    }
  });
}

app.get('/urlbydomainid', function(req, res) {
//////// Parameters Checking /////////
  if (!req.query.domainid) {
    return res.status(400).send( ErrorMsg.missing_domainid );
  }

  //if the enrollment has been cache we just return it and that is it
   var enrollment =_.find(enrollments, {domainid: req.query.domainid});
   if (enrollment) {
   res.status(200).send({
     url: enrollment.mcurl
   });
   return;
   }

  //if the enrollment has NOT been cache we will have to find it in the database.....
  request({
    rejectUnauthorized: false,
    rejectUnauthorized: false,
    url: appconfig.ddb_url + "/getTenantUrl",
    method: 'GET', //Specify the method
    headers: { //We can define headers too
      'Content-Type': 'application/json'
    },
    qs: {tenantId: req.query.domainid }
  }, function(error, response, body){
    if(error) {
      console.log(error);
      res.status(400).send(ErrorMsg.db_connection_not_establish);
    } else {
      console.log(response.statusCode, body);

      if (response.statusCode === 200){


        var body = JSON.parse(response.body);

          res.status(200).send({
            url: body.mcurl,
            clientId: body.clientid
          });

      } else if (response.statusCode === 404) {
        res.status(404).send(ErrorMsg.tenantid_not_registered);
      }
      else {
        res.status(400).send(ErrorMsg.tenantid_not_registered);
      }
    }
  });


});
/////*******************************************
app.post('/sessions/create', function(req, res) {
//////// Parameters Checking /////////
  if (!req.body.domainid) {
    return res.status(400).send(ErrorMsg.missing_domainid);
  }

  if (!req.body.code && !req.body.username) {
    return res.status(400).send(ErrorMsg.missing_username);
  }
  if (!req.body.code && !req.body.password) {
    return res.status(400).send(ErrorMsg.missing_password);
  }
  if (!req.body.code && !req.body.username && !req.body.password) {
    return res.status(401).send(ErrorMsg.unauthorized_and_missing_idp_code);
  }

//////////////////////////////////////////////////
  // ensure user has an authorized code to log in. Otherwise reject

  var _reqBody = req.body.domainid;
  var fullState = _reqBody.split('?');
  var _tenantID = fullState[0];
  var enrollment;

  if (req.query.domainid) enrollment =_.find(enrollments, {domainid: req.query.domainid});
  if (_tenantID) enrollment =_.find(enrollments, {domainid: _tenantID});
  if (!enrollment) {enrollment = {};}

  try {
    request({
      rejectUnauthorized: false,
      url: appconfig.ddb_url + "/getEnrollment",
      method: 'GET', //Specify the method
      headers: { //We can define headers too
        'Content-Type': 'application/json'
      },
      qs: {tenantId: _tenantID}
    }, function (error, response, body) {
      if (error) {
        console.log(error);
        res.status(400).send(ErrorMsg.mcurl_enrollement_failed_url_not_reachable);
      } else {
        console.log(response.statusCode, body);
        try { enrollment = JSON.parse(body);} catch(e) {};   //if not valid enrollment is comming we may keep the one from cache
        if ( enrollment.domainid  || response.statusCode === 200) {
          try {

            grant_type = "grant_type=authorization_code&code=" + req.body.code;
            request({
              rejectUnauthorized: false, //need to improve this ..related with ssl certificate
              url:   enrollment.mcurl + "/api/token",
              method: 'POST', //Specify the method
              headers: { //We can define headers too
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': "Basic " + enrollment.clientsecret
              },
              body: grant_type
            }, function(error, response, _body){
              if(error) {
                console.log(error);
                res.status(400).send(ErrorMsg.login_failed_authentication);
              } else {
                console.log(response.statusCode, body);
                if (response.statusCode === 200){

                  _body = JSON.parse(_body);

                  request({
                    "rejectUnauthorized": false,
                    url: enrollment.mcurl + '/oauth/userinfo',
                    method: 'GET', //Specify the method
                    headers: { //We can define headers too
                      'Authorization': 'bearer ' + _body.access_token
                    }
                  }, function(error, response, __body){
                    if(error) {
                      console.log(error);
                      res.status(200).send("hi from modulus error:" + error);
                    } else {
                      console.log(response.statusCode, body);
                      var mbuser = JSON.parse(__body);
                      if (mbuser.Name) {
                        tokenpayload = {};
                        tokenpayload.username = mbuser.Name;
                        tokenpayload.domainid = enrollment.domainId;
                        tokenpayload.tenantId = enrollment.tenantId;
                        res.status(200).send({
                          id_token: createToken(tokenpayload)
                        });
                      }
                    }
                  });

                } else {
                  res.status(400).send(ErrorMsg.login_failed_authentication);
                }
              }
            });

          } catch (e){
            console.log(e);
            return res.status(400).send (ErrorMsg.token_verification_failed);
          }

        } else if (response.statusCode === 404) {
          res.status(404).send(ErrorMsg.token_verification_failed);
        }
        else {
          res.status(400).send(ErrorMsg.mcurl_enrollement_failed_authentication);
        }
      }
    });
  }
  catch (e) {
    console.log(e);
    return res.status(400).send (ErrorMsg.token_verification_failed);
  }

});

var nodemailer = require('nodemailer');

var sendmail = require('sendmail')();

function sendEmail(enrollment)
{
  sendmail({
    from: 'no-reply@yourdomain.com',
    to: 'pablo.elustondo@gmail.com',
    subject: 'test sendmail',
    html: 'Mail of test sendmail ',
  }, function (err, reply) {
    console.log(err && err.stack);
    console.dir(reply);
  });
};

function log_action(classifier, message, priority, tenantId, params, callback){
  var timeStamp = new Date().getTime();
  var messages = {
  "Classifier" : classifier,
  "serverId" : process.pid.toString(),
  "Producer" : "DSS",
  "message" : message,
  "Priority" : priority,
  "tenantId" : tenantId,
  "params" : params
  };

  var payloads = [{ topic: 'log', messages: JSON.stringify(messages), partition: 0 }];
  producer.send(payloads, function(err, data) {
    //console.log(JSON.stringify(payloads));
    callback();
  });
}

function sendEmail2(enrollment,token) {

  var transporter = nodemailer.createTransport({
    service: 'Yahoo',
    auth: {
      user: 'dad666@yahoo.com',
      pass: 'aaa111bbb'
    }
  });
  var text = 'Hello from DSS to:' + enrollment.username;

  var mailOptions = {
    from: 'dad666@yahoo.com', // sender address
    to: enrollment.accountid, // list of receivers
    cc: 'pablo.elustondo@rogers.com',
    subject: 'SOTI DAD - MobiControl Enrollment', // Subject line
    html: '<b>Hi, it seems that '+ enrollment.username + ' have used this account to register domain ' + enrollment.domainid +' to SOTI Data Analytics Services, if this is corrrect, please confirm you enrollment by clicking this \<a href=\"http://localhost:3004/confirm?token=' + token +'\">link</a></b>.'
  };

  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      console.log("sendMail error: " + error);
    }else{
      console.log('Message sent: ' + info.response);
    };
  });
  transporter.close();
}
