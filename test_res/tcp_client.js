

var net = require('net');

var client = net.connect({port: 8124}, function() { //'connect' listener
    console.log('connected to server!');

    var data = '{\
                "name": "MICO3288",\
                "device_id": "HX2504",\
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
            }';

    client.write(JSON.stringify(data));
});

client.on('data', function(data) {
    console.log(data.toString());
    //client.end();
});

client.on('end', function() {
    console.log('disconnected from server');
});
