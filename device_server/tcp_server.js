/**
 * Created by missionhealth on 15/10/22.
 */

var net = require('net');
var db = require('./device_db');
var port = require('../settings.js');

// save online devices
global.online_device = {};

var server = net.createServer(function(c) { //'connection' listener

    // server address
    var address = c.address();
    console.log('server address = %j', address);

    // client address
    var client = c.remoteAddress + ':' + c.remotePort;
    console.log('client connected[%s]', client);

    // save connected device ip and connect time
    global.online_device[client] = {
        connect_time: Date.now(),
        c: c
    };

    console.log('online_device -> %j', global.online_device[client].connect_time);

    var recv_data_callback = function (data) {
        var recv_json;

        try {
            recv_json = JSON.parse(data);
        } catch (e) {
            console.log('*** recv data error: ' + e);
            return;
        }

        var device_data = {
            ip_address: client,
            recv_time: Date.now(),
            sensor_data: recv_json
        };

        db.save(device_data, function(err, data) {
            if (err) console.log('database error ' + err);

            //db.get('HX2504', function(err, data) {
            //    if (err) {
            //        console.log('database error ' + err);
            //        return;
            //    }
            //});
        });
    };

    c.on('end', function() {
        var start = global.online_device[client].connect_time;
        var connect_time = Date.now() - start;
        console.log('client disconnected[%s], elapsed time = %d seconds', client, connect_time/1000);

        delete global.online_device[client];
    });

    c.on('error', function(err) {
        console.log('' + err);
        var start = global.online_device[client].connect_time;
        var connect_time = Date.now() - start;
        console.log('client[%s], elapsed time = %d seconds', client, connect_time/1000);
  
        delete global.online_device[client];
    });

    c.on('data', recv_data_callback);
});

module.exports = server;
