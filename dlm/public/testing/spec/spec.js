 var A1_Mind = {"name":"A1-Mind"};
 var sample_dss_config = {"tenatID":"tenantXYZ",
 "customerID": "random",
     "accessUsername": "cutomername",
 "accessPswd":"hqWK{u9A)",
     'RedShiftConnectionString': 'Testing1233dataanalytics.cxvwwvumct05.us-east-1.redshift.amazonaws.com',
     'DBName': 'dataanalyticsdb'
 };
 var original = {"tenatID":"tenantXYZ",
     "customerID": "random",
     "accessUsername": "cutomername",
     "accessPswd":"hqWK{u9A)",
     'RedShiftConnectionString': 'dataanalytics.cxvwwvumct05.us-east-1.redshift.amazonaws.com',
     'DBName': 'dataanalyticsdb'
 };


var temp={};
var sampleconfig = {
  "_id": "5667c384d0e9376908d9bf66",
  "name": "Mc Genie Sample Config",
  "id": "0",
  "type": "app",
  "configs": [
    {
      "name": "Header...",
      "id": "header",
      "type": "header",
      "configs": [],
      "files": [],
      "data": null,
      "source": null,
      "expanded": false,
      "checked": false
    },
    {
      "name": "List of All Device Groups",
      "id": "list1",
      "type": "list",
      "configs": [],
      "files": [],
      "data": [
        {
          "Name": "if you see this",
          "Path": "you probably are not logged in or lost your token"
        }
      ],
      "source": "devicegroups",
      "mfields": [
        "Name",
        "Path",
        "Icon",
        "Kind"
      ],
      "dfields": [
        {
          "name": "Name",
          "value": "blah"
        },
        {
          "name": "Path",
          "value": "blah"
        },
        {
          "name": "Icon",
          "value": "blah"
        },
        {
          "name": "Kind",
          "value": "blah"
        }
      ],
      "efields": [
        {
          "name": "Name",
          "value": "blah"
        }
      ],
      "expanded": false,
      "checked": false
    },
    {
      "name": "Footer...",
      "id": "footer",
      "type": "footer",
      "configs": [],
      "files": [],
      "data": null,
      "source": null,
      "expanded": false,
      "checked": false
    },
    {
      "name": "List of All Devices.",
      "id": "list1",
      "type": "list",
      "configs": [],
      "files": [],
      "data": [
        {
          "Name": "are you logged in?",
          "Path": "do you have a token?"
        }
      ],
      "source": "devices",
      "mfields": [
        "DeviceName",
        "DeviceId"
      ],
      "dfields": [
        {
          "name": "DeviceName",
          "value": "blah"
        },
        {
          "name": "DeviceId",
          "value": "blah"
        },
        {
          "name": "BatteryStatus",
          "value": "blah"
        },
        {
          "name": "LastCheckInTime",
          "value": "blah"
        }
      ],
      "actions": [
        {
          "Action": "CheckIn"
        },
        {
          "Action": "SendMessage",
          "Message": "Hellow from Mc Genie!"
        }
      ],
      "expanded": false,
      "checked": false
    }
  ],
  "files": [],
  "data": null,
  "source": null,
  "expanded": false,
  "checked": false
};

describe("Test services to make restfull calls", function() {

    /*
    describe("GET /", function() {
        it("returns project name", function(done) {
            $.get("/", function(data, textStatus, jqXHR) {
                expect(data).toBe("Jassplan TO-DO REST API Version 16");
                done();
            });
        });
    });
/*
    describe("DEL /todo", function() {
        it("drops a possible todo db for user 'test'", function(done) {
            $.ajax(
                {   url:"/todo",
                    type:"DELETE",
                    success:function(data, textStatus, jqXHR) {
                                var emptyArray = [];
                                expect(data).toBeDefined();
                                done();}
                });
        });
    });

    describe("GET /todo", function() {
        it("returns empty todo list the first time, after db was dropped", function(done) {
            $.get("/todo", function(data, textStatus, jqXHR) {
                var emptyArray = [];
                expect(data).toBeDefined();
                expect(data.data).toBeDefined();
                expect(data.data.length).toBe(0);
                done();
            });
        });
    });

    describe("POST /todo", function() {
        it("creates a todo collection for test user and adds a first item", function(done) {
            $.ajax({
                url: "/todo",
                type:"POST",
                data: "{\"name\":\"A1-Mind\"}",
                contentType:"application/json",
                success: function(data, textStatus, jqXHR) {
                    console.log("From post: " + JSON.stringify(data,null,2));
                    temp = data.data.ops[0];
                    temp.name = "A1-Mind2";
                    var emptyArray = [];
                    expect(data).toBeDefined();
                    expect(data.data).toBeDefined();
                    expect(data.data.ops.length).toBe(1);
                    done();}
            });
        });
    });

    describe("POST /todo", function() {
        it("adds sample db users for DSS an", function(done) {
            $.ajax({
                url: "/todo",
                type:"POST",
                data: "{\"tentantID\":\"WHOA\" ," +
                "\"sotiUserName\":\"hahahahah\", " +
                "\"password\":\"ItWontBeThisEasy\"}",
                contentType:"application/json",
                success: function(data, textStatus, jqXHR) {
                    console.log("From post: " + JSON.stringify(data,null,2));
                    temp = data.data.ops[0];
                    temp.name = "A1-Mind2";
                    var emptyArray = [];
                    expect(data).toBeDefined();
                    expect(data.data).toBeDefined();
                    expect(data.data.ops.length).toBe(1);
                    done();}
            });
        });
    });


    describe("GET /todo", function() {
        it("returns a todo list with one item, as  posted before", function(done) {
            $.get("/todo", function(data, textStatus, jqXHR) {
                var emptyArray = [];
                expect(data).toBeDefined();
                expect(data.data).toBeDefined();
                expect(data.data.length).toBe(1);
                expect(data.data[0].name).toBe("A1-Mind");
                done();
            });
        });
    });

    describe("PUT /todo", function() {
        it("creates a todo collection for test user and adds a first item", function(done) {
            $.ajax({
                url: "/todo",
                type:"PUT",
                data: JSON.stringify(temp),
                contentType:"application/json",
                success: function(data, textStatus, jqXHR) {
                    console.log("From put: " + JSON.stringify(data,null,2));
                    var emptyArray = [];
                    expect(data).toBeDefined();
                    expect(data.data).toBeDefined();
                    expect(data.status).toBe('ok');
                    done();}
            });
        });
    });

    describe("GET /todo", function() {
        it("returns a todo list with one item, as  posted before", function(done) {
            $.get("/todo", function(data, textStatus, jqXHR) {
                var emptyArray = [];
                expect(data).toBeDefined();
                expect(data.data).toBeDefined();
                expect(data.data.length).toBe(1);
                expect(data.data[0].name).toBe("A1-Mind2");
                done();
            });
        });
    });

    describe("DEL /todo", function() {
        it("drops a possible todo db for user 'test'", function(done) {
            $.ajax(
                {   url:"/todo",
                    type:"DELETE",
                    success:function(data, textStatus, jqXHR) {
                        var emptyArray = [];
                        expect(data).toBeDefined();
                        done();}
                });
        });
    });

    describe("POST /todo", function() {
        it("creates a first genie spec", function(done) {
            $.ajax({
                url: "/todo",
                type:"POST",
                data: JSON.stringify(sampleconfig),
                contentType:"application/json",
                success: function(data, textStatus, jqXHR) {
                    var emptyArray = [];
                    expect(data).toBeDefined();
                    expect(data.data).toBeDefined();
                    done();}
            });
        });
    });

    describe("POST /todo", function() {
        it("creates a first genie spec", function(done) {
            $.ajax({
                url: "/todo",
                type:"POST",
                data: JSON.stringify(original),
                contentType:"application/json",
                success: function(data, textStatus, jqXHR) {
                    var emptyArray = [];
                    expect(data).toBeDefined();
                    expect(data.data).toBeDefined();
                    done();}
            });
        });
    });

     */
    describe("Call API with valid data", function() {

    });

});
