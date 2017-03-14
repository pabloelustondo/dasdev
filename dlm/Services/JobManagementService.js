

var config = require('../appconfig.json');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var agenda = require('./Agenda');

JobManagementService = {
    // ensure job is defined. If not defined, define it
    findJob: function(jobName, callback) {
        agenda.jobs({
            name: config['api_service_job_name']
        }, function (err, job) {
            if (err) {
                callback(err);
            } else {
                callback(null, job);
            }
        });
    },

    findJobByDataSource: function(dataSourceId, callback) {

        if (!dataSourceId){
            callback(new Error ('missing data source Id'), null);
        }

        agenda.jobs({
            'data.dataSourceId' : dataSourceId
        }, function ( err, result) {
            if (result.length == 0 ){
                callback (null, null);
            } else {
                callback(null, result);
            }
        });
    },

    deleteJobsByDataSource: function(dataSourceId, callback) {
        agenda.cancel({
            'data.dataSourceId' : dataSourceId
        }, function (err, numRemoved) {
            if(err) {
                callback(err);
            } else {
                callback(null, numRemoved);
            }
        });
    },

    addJob: function(jobData, callback) {

        if (!jobData.dataSourceId){
            callback(new Error ('missing dataSourceId'),null);
        }
        else if (!jobData.url){
            callback(new Error ('missing url'),null);
        }
        else if (!jobData.tenantId){
            callback(new Error ('missing tenantId'),null);
        }
        else if (jobData.expiringToken === undefined){
            callback(new Error ('missing expiring token'),null);
        }
        else if (!jobData.method) {
            callback(new Error ('missing api call type'), null);
        }


        else {
            var job = agenda.create(config['api_service_job_name'], {
                url: jobData.url,
                method: jobData.method,
                dataSourceId: jobData.dataSourceId,
                expiringToken: jobData.expiringToken,
                tenantId: jobData.tenantId
            });
            job.unique({
                dataSourceId: jobData.dataSourceId
            }, true);
            job.repeatEvery(jobData.interval + ' seconds');
            job.enable();
            job.save(function (err) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, true);
                }
            });
        }

    },

    removeJob: function(job, callback) {
        job.remove(function(err) {
            if(!err) {
                console.log('successfully removed job from collection');
                callback();
            }
        });
    },

    updateJob: function(job, callback) {
        //TODO: implement
    },

    enableJob: function(job, callback) {
        job.enable();
    },

    disableJob: function(job, callback) {
        job.disableJob();
    }

};

module.exports = JobManagementService;