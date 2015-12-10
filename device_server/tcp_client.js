/**
 * Created by bruce on 15/12/10.
 */
var net = require('net');

var client = net.connect({port: 17479,host:"bruce-zhu.xicp.net"}, function() { //'connect' listener
    console.log('connected to server!');

    var data = {
                "name": "bruce",
                "device_id": "bruce1",
                "sensor":"Hello this is test from remote server"
                };

    client.write(JSON.stringify(data));
});

client.on('data', function(data) {
    console.log(data.toString());
    //client.end();
});

client.on('end', function() {
    console.log('disconnected from server');
});
