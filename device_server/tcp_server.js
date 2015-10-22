/**
 * Created by missionhealth on 15/10/22.
 */

var net = require('net');
var Db = require('./device_db');

var server = net.createServer(function(c) { //'connection' listener
    var client = c.remoteAddress + ':' + c.remotePort;
    console.log('client connected[%s]', client);

    c.on('end', function() {
        console.log('client disconnected[%s]', client);
    });
    c.on('data', function(data) {
        console.log('RECV: %s', data.toString());

        var recv_json;

        try {
            recv_json = JSON.parse('{\
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
                        "latitude": 31.2345\
                    }\
                }\
            ]\
        }');
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

    c.pipe(c);
});

server.on('error', function(e) {
    console.log('server error:' + e);
});

server.listen(8124, function() { //'listening' listener
    console.log('server bound');
});

