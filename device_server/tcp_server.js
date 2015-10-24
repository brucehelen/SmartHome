/**
 * Created by missionhealth on 15/10/22.
 */

var net = require('net');
var db = require('./device_db');
var port = require('../settings.js');

// save online devices
global.online_device = {};

var server = net.createServer(function(c) { //'connection' listener

    var client = c.remoteAddress + ':' + c.remotePort;
    console.log('client connected[%s]', client);

    // save connected device ip and connect time
    global.online_device[client] = new Date();

    var recv_data_callback = function (data) {
        console.log(data);
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

        var device_data = {
            ip_address: client,
            recv_time: new Date(),
            sensor_data: recv_json
        };

        db({'sensor_data.device_id': 'HX2501'}, function(err, data) {
            if (err) {
                console.log('database error ' + err);
                return;
            }

            console.log(JSON.stringify(data));
        });

        //db(device_data, function(err) {
        //    if (err) console.log('db save error ' + err);
        //});
    };

    c.on('end', function() {
        var start = global.online_device[client];
        var end = new Date();
        var connect_time = end.getTime() - start.getTime();
        console.log('client disconnected[%s], elapsed time = %d seconds', client, connect_time/1000);

        delete global.online_device[client];
    });

    c.on('data', recv_data_callback);
});

module.exports = server;
