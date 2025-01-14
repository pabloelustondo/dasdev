'use strict';

const Cucumber = require('cucumber');
const Request = require('request');
const FS = require('fs');


Cucumber.defineSupportCode(function(context) {
    var Given = context.Given;
    var When = context.When;
    var Then = context.Then;
    const globalconfig = require(process.cwd()+'\\globalconfig_test.json');
    // Testing Values
    var testJWT;
    var newUser;
    Request.debug = false;

    var responseCode = 0;
    var responseData = '';
    var xaccesskey = '';
    var invalidToken = 'invalidtokenasdasdasdas';
    var validToken = '';
    var oldauthorizationToken = '';
    var url = '';
    var timeStamp = new Date().getTime();;
    //some necessary evil for things that cannot be retrieved through the API
   /* var mobiUrl = "https://cad099.corpss.soti.net/";
    var downAgentId = "31940960-70f1-4d92-aedd-a148f19c8757";
    var delAgentId1 = "c4b1c820-48f6-4e9b-a100-bc714043dff3";
    var delAgentId2 = "a14e1739-18e0-44f9-9471-69e842be98ad";
    */

   // Request Structure
    var options  = {
        'uri': '',
        'rejectUnauthorized': false,
        'headers' : {
            'Content-Type': 'application/json',
            'Keep-Alive': true,
            'Accept-Encoding': 'gzip,deflate'
        }, 'body':{}
    };

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     Step Definitions
     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    Given('I create new user with the following data', function (table, callback) {
        resetOptions('/enrollments');
        options.form = table.hashes()[0];
        callback();
        //options.form.domainid = stringInDoubleQuotes;
        //console.log(options);

    });


    Then(/^The HTTP Code should be (.*)$/, function (httpCode, callback) {
        if(httpCode) {
            callback();
        } else {
            console.error('Expected httpCode: ' + httpCode
                + ', but received: ' + testResponse.statusCode);
            console.error('Error Response :' + responseData);
        }
    });

    Then(/^The response should contain '(.*)'$/, function (response, callback) {
        var resString = JSON.stringify(responseData).toLowerCase();
        if(resString.includes(response.toLowerCase())) {
            callback();
        } else {
            console.error('Expected response: ' + response
                + ', but received: ' + resString);
            return new Error('Expected response: ' + response
                + ', but received: ' + resString);
        }
    });

    Given(/^I submit using valid values$/, function (callback) {
        resetOptions('/enrollments');

        Request.post(options, function (error, response, body) {
            responseData = body;
            responseCode = response.statusCode;
            testJWT = response.id_token || '';
            callback();
        }).on('error', function (error) {
            console.log("Error with Request:" + error);
        });
    });

    Given(/^I submit with missing (.*)$/, function (variable, callback) {
        resetOptions('/enrollments');
        options.form[variable] = '';

        Request.post(options, function (error, response, body) {
            responseData = body;
            responseCode = response.statusCode;

            callback();
        }).on('error', function (error) {
            console.log("Error with Request:" + error);
        });
    });

    Given(/^I submit with invalid (.*) value: (.*)$/, function (variable, value, callback) {
        resetOptions('/enrollments');
        options.form[variable.toLowerCase()] = value;

        Request.post(options, function (error, response, body) {
            responseData = body;
            responseCode = response.statusCode;

            callback();
        }).on('error', function (error) {
            console.log("Error with Request:" + error);
        });
    });

    Given('I POST with enrollment data for {stringInDoubleQuotes}', function(stringInDoubleQuotes, callback){
        resetOptions('/enrollments');
        resetFormOldValues(stringInDoubleQuotes);
        Request.post(options, function (error, response, body) {
            responseData = body;
            responseCode = response.statusCode;
            testJWT = JSON.stringify(responseData) || '';
            //console.log(responseData);
            callback();
        }).on('error', function (error) {
            console.log("Error with Request:" + error);
        });
    });

    Given(/^I do a '(.*)' request with valid values$/, function(httpCall, callback){
        resetFormValid('/enrollments');

        //options.baseUrl = 'https://dev2012r2-sk.sotidev.com:3003/#/';

        Request[httpCall.toLowerCase()](options, function (error, response, body) {
            responseData = body;
            responseCode = response.statusCode;
            testJWT = JSON.stringify(responseData) || '';

            callback();
        }).on('error', function (error) {
            console.log("Error with Request:" + error);
        });
    });


    Then(/^The response should be a HTML Document -> (.*)$/, function (fileName, callback) {
        FS.readFile(fileName, 'utf8', function(error, contents) {
            if (error) {
                console.log( error);
                return;
            }
            //Remove Whitespace issues while comparing
            if (contents.toString().replace(/\s/g, "") === responseData.toString().replace(/\s/g, "")) {
                callback();
            }
        })
    });

    Then(/^The response\'s id_token should be valid$/, function (callback) {
        if(responseData.includes("id_token")) {
            callback();
        } else {
            console.error('Token was not found in response: ' + JSON.stringify(responseData));
            throw new Error('Token was not found in response: ' + JSON.stringify(responseData));
        }
    });

    Given(/^I do a '(.*)' request with valid login values$/, function (httpCall, callback) {
        resetFormValid('/login');
        options.form = {
            'domainid': newUser
        };

        Request[httpCall.toLowerCase()](options, function (error, response, body) {
            responseData = body;
            responseCode = response.statusCode;

            callback();
        }).on('error', function (error) {
            console.log("Error with Request:" + error);
        });
    });

    Given(/^I do a '(.*)' request with no login values$/, function (httpCall, callback) {
        resetFormValid('/login');
        options.form = {
            'domainid': ''
        };
        Request[httpCall.toLowerCase()](options, function (error, response, body) {
            responseData = body;
            responseCode = response.statusCode;

            callback();
        }).on('error', function (error) {
            console.log("Error with Request:" + error);
        });
    });

    //Shirley tests----------------------------------------------------------------------
    Given(/^I grab the access token from '(.*)'$/, function (variable, callback) {
        FS.readFile("features/assets/"+variable, 'utf8', function(err, contents) {
            if (err) return console.log(err);
            xaccesskey = contents;
            //console.log(contents);
            callback();
        });
    });
    Given('I delete all user information for {stringInDoubleQuotes}', function (stringInDoubleQuotes, callback) {
        // Write code here that turns the phrase above into concrete actions
        var ddb_url = globalconfig.ddb_url;
        if(ddb_url == "" || ddb_url == undefined) throw new Error('ddb url not in global config file');
        url = ddb_url
        resetOptions("tenant/"+stringInDoubleQuotes);
        Request.delete(options, function (error, response, body) {
            responseData = body;
            responseCode = response.statusCode;
            if(!responseData.includes("Not Found") && responseCode!=200 && responseData.ok != 1){
                console.error('Could not delete: '+ responseData);
            }
            callback();
        });
        callback();
    });

    Then(/^a new log should have been created$/, function(table, callback) {
        // Write code here that turns the phrase above into concrete actions
        var logInfo = table.hashes()[0];
        //call ddb for latest log
        callback(null, 'pending');
    });

    Given('I set post request for registering data source', function (table, callback) {
        //options.headers["x-access-token"] = stringInDoubleQuotes;
        options.form = table.hashes()[0];
        options.uri = url;
        callback();
    });

    Given(/^I grab '(.*)' url from config file$/, function (variable, callback) {
        // Write code here that turns the phrase above into concrete actions
        var tmp_url = globalconfig[variable+'_url'];
        if(tmp_url == "" || tmp_url == undefined) throw new Error(variable + ' url not in global config file');
        url = tmp_url
        callback();

    });

 /*   Given('I set valid header and body for test_user', function (callback) {
        options.headers['x-access-token'] = invalidToken;
        options.body = {
            'tenantid': "test_user",
            'dataSourceType': "MobiControl",
            'agentid': "asdas",
            'data': {
                'inputName': "mcurl",
                'inputValue': mobiUrl
            }
        };
        callback();
    });*/

    When('I POST to endpoint {stringInDoubleQuotes}', function (stringInDoubleQuotes, callback) {

        options.uri = url+'/'+stringInDoubleQuotes;
        Request.post(options, function (error, response, body) {
            responseData = body;
            responseCode = response.statusCode;
            callback();
        });
    });

    Then('response message should {stringInDoubleQuotes} {stringInDoubleQuotes}', function (stringInDoubleQuotes, stringInDoubleQuotes2, callback) {
        if(stringInDoubleQuotes == "not be"){
            if (responseData == stringInDoubleQuotes2)
                throw new Error("response message is: "+ responseData);
        }else if(stringInDoubleQuotes == "be"){
            if (responseData != stringInDoubleQuotes2)
                throw new Error("response message is: "+ responseData);
        }
        callback();
    });

/*    Given('I set invalid header and body for test_user for delete', function (callback) {
        options2.headers['x-access-token'] = invalidToken;
        options2.body['agentid'] = delAgentId1;
        callback();
    });*/

/*    Given('I set valid header and body for test_user for delete', function (callback) {
        FS.readFile("features/assets/PermanentToken", 'utf8', function(err, contents) {
            if (err) return console.log(err);
            validToken = contents;
            callback();
        });
        options2.headers['x-access-token'] = validToken;
        options2.body['agentid'] = delAgentId2;
        callback();
    });*/

    /*When('I GET :portnumber with endpoint {stringInDoubleQuotes} to download credentials', function (stringInDoubleQuotes, callback) {
        options2.baseUrl = url + ':' + portnumber;
        options2.url = stringInDoubleQuotes + '/' + downAgentId;
        options2.preambleCRLF = options2.postambleCRLF = true;
        Request.get(options2, function (error, response, body) {
            if (error) {
                throw new Error('upload failed:', error);
            }
            responseData = body;
            responseCode = response.statusCode;
            callback();
        });
    });*/

    When('I make GET request to endpoint {stringInDoubleQuotes}', function (stringInDoubleQuotes, callback) {
        resetOptions(stringInDoubleQuotes);
        options.headers['x-access-token'] = xaccesskey;
        Request.get(options, function (error, response, body) {
            if (error) {
                throw new Error('upload failed:', error);
            }
            responseData = body;
            responseCode = response.statusCode;
            //console.log(responseData);
            callback();
        });
    });

    Then('I should receive my user information with all the valid fields', function (table, callback) {

        var table_json = table.hashes()[0];
        var res = JSON.parse(responseData);
        if(table_json['domainid']!=res['domainid'] || table_json['tenantid']!=res['tenantid']) {
            console.error('Response contains missing fields: ' +responseData);
            return new Error("Response: " + responseData + "does not contain all the valid fields: " + table_json);
        }
        callback();
    });

    Given('I set head and body for handling credentials', function (callback){
        options.headers['x-access-token'] = validToken;
        //options.body['agentid'] = agentID;
        //callback();
    });

    Then('I GET :idaportnumber with old credentials and endpoint {stringInDoubleQuotes}', function (stringInDoubleQuotes, callback) {
        options2.preambleCRLF = options2.postambleCRLF = true;
        options2.url = stringInDoubleQuotes;
        options2.headers['x-access-token'] = oldauthorizationToken;
        options2.baseUrl = url + ':' + portnumber;
        Request.get(options2, function (error, response, body) {
            if (error) {
                throw new Error('upload failed:', error);
            }
            responseData = body;
            responseCode = response.statusCode;
            callback();
        })
    });

    /*Then('I POST :portnumber with endpoint {stringInDoubleQuotes} to reset credentials', function (int, stringInDoubleQuotes, callback) {
        options2.preambleCRLF = options2.postambleCRLF = true;
        options2.url = stringInDoubleQuotes + '/' + downAgentId;
        options2.headers['x-access-token'] = oldauthorizationToken;
        options2.baseUrl = url + ':' + portnumber;
        Request.post(options2, function (error, response, body) {
            if (error) {
                throw new Error('upload failed:', error);
            }
            responseData = body;
            responseCode = response.statusCode;
            callback();
        });
    });*/

    Then('response body contain some sort of error', function (callback) {
        var resString = JSON.stringify(responseData).toLowerCase();
        if(responseData['error'] || responseData['metaData'] == "Error") {
            throw new Error("This shouldn't pass what the hell: " + resString);
        }
        callback();
    });

    Then('response code should be {int}', function (int, callback) {
        var resString = JSON.stringify(responseData).toLowerCase();
        if(responseCode != int) {
            console.error('Response should be :' + int + ', Got:' + responseCode+'\n '+ resString);
            throw new Error('Response should be :' + int + ', Got:' + responseCode+'\n '+ resString);
        }
        callback();
    });

    Then(/^I store the response token in a file '(.*)'$/, function (variable,callback) {
        //console.log(authorizationToken);
        var responseJSON = JSON.parse(responseData);
        validToken = responseJSON['id_token'];
        FS.writeFile("features/assets/"+variable, validToken, function(err) {
            if(err) {
                throw new Error(err);
            }
            //console.log("The file was saved!");
            callback();
        });
    });
    Given('I create a login session as {stringInDoubleQuotes}', function (stringInDoubleQuotes, table, callback) {
        //create request for login session
        options = {
            url : url+"/sessions/create",
            json: true,
            method : "POST",
            headers: { //We can define headers too
                'Content-Type': 'application/JSON'
            },
            body: table.hashes()[0]
        };
        Request ( options, function (err, response) {
            //console.log(response.statusCode);
            responseData = response.body;
            responseCode = response.statusCode;
            callback();
        }).on('error', function (error) {
            console.log("Error with Request:" + error);
        });
    });
    Then('I should receive my user information', function (callback) {
        var resString = JSON.stringify(responseData).toLowerCase();
        if(responseData['"new"'] ) {
            console.log("Verified");
        }
        callback();
    });
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     UTILITIES
     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    function resetFormValid() {
        //Fake Characters
        newUser = "";
        var wordChoice = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';

        // Create New User
        for(var i = 0; i < 13; i++) {
            newUser += wordChoice[Math.floor(Math.random() * (i + 31)) % 72];
        }
        newUser = newUser.replace('undefined', '').replace(/\s/, '');
        newUser = 'bdd_user_' + newUser;

        options.form = {
            accountid: 'ray.gervais@rgervais.net',
            apikey: '244cc44394ba4efd8fe38297ee8213d3',
            clientsecret: '1',
            domainid: newUser,
            mcurl: 'https://cad099.corp.soti.net/MobiControl',
            password: '1',
            username: 'administrator'
        };
    }

    function resetFormOldValues(tenant) {
        options.form = {
            accountid: 'external_user',
            apikey: '244cc44394ba4efd8fe38297ee8213d3',
            clientsecret: '1',
            domainid: 'bdd_old_account',
            mcurl: 'https://cad099.corp.soti.net/MobiControl',
            password: '1',
            username: 'administrator',
            tenantid: tenant,
        };
    }

    function resetOptions(endpoint) {
        options  = {
            'uri': url +'/'+endpoint,
            'rejectUnauthorized': false,
            'headers' : {
                'Content-Type': 'application/json',
                'Keep-Alive': true,
                'Accept-Encoding': 'gzip,deflate'
            },
            'body' :{},
            'form' :{}
        };
    }
});