/**
 * Created by missionhealth on 15/10/22.
 */

var net = require('net');
var Db = require('./device_db');
var port = require('../settings.js');

// save online device
global.online_device = {};

var server = net.createServer(function(c) { //'connection' listener

    var client = c.remoteAddress + ':' + c.remotePort;
    console.log('client connected[%s]', client);

    // save connected device ip and connect time
    global.online_device[client] = new Date();

    c.on('end', function() {
        console.log('client disconnected[%s]', client);

        delete global.online_device[client];
        console.log('online_device: ' + global.online_device[client]);
    });
    c.on('data', function(data) {
        var recv_json;
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
