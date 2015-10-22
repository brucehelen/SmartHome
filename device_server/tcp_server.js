/**
 * Created by missionhealth on 15/10/22.
 */

var net = require('net');
var Db = require('./device_db');

var server = net.createServer(function(c) { //'connection' listener

    var client = c.remoteAddress + ':' + c.remotePort;
    console.log('client connected[%s]', client);

    // 设置设备在线状态





    c.on('end', function() {
        console.log('client disconnected[%s]', client);
    });
    c.on('data', function(data) {
        console.log('RECV: %s', data.toString());

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

server.on('error', function(e) {
    console.error('tcp server error:' + e);
});

server.listen(8124, function() { //'listening' listener
    console.log('tcp server bound');
});
