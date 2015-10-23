/**
 * Created by missionhealth on 15/10/22.
 */

var net = require('net');
var Db = require('./device_db');
var port = require('../settings.js');

// save online devices
global.online_device = {};

var server = net.createServer(function(c) { //'connection' listener

    var client = c.remoteAddress + ':' + c.remotePort;
    console.log('client connected[%s]', client);

    // save connected device ip and connect time
    global.online_device[client] = new Date();

    c.on('end', function() {
        var start = global.online_device[client];
        var end = new Date();
        var connect_time = end.getTime() - start.getTime();
        console.log('client disconnected[%s], elapsed time = %d seconds', client, connect_time/1000);

        delete global.online_device[client];
    });
    c.on('data', function(data) {
        var recv_json;

        data = '{\
            "name": "MICO3288",\
                "device_id": "HX2501",\
                "sensor":\
            [\
                {\
                    "type": 1,\
                    "value": 23.5\
                },\
                {\
                    "type":2,\
                    "value":25\
                },\
                {\
                    "type":3,\
                    "value":\
                    {\
                        "pm2_5": 23.6,\
                        "pm10":102\
                    }\
                },\
                {\
                    "type": 4,\
                    "value":\
                    {\
                        "longitude": 121.2356,\
                        "longitude": 31.2345\
                    }\
                }\
            ]\
        }';

        try {
            recv_json = JSON.parse(data);
        } catch (e) {
            console.log('recv data error: ' + e);
            return;
        }

        var deviceDb = new Db({
            ipaddress: client,
            recvtime: new Date(),
            sensor: recv_json
        });

        deviceDb.save(function(err) {
            if (err) console.log('save data to db error: ' + err);
        });
    });
});

module.exports = server;
