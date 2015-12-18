/**
 * Created by bruce on 15/12/10.
 */
var net = require('net');

var remote_server = "bruce-zhu.xicp.net";
var remote_server_port = 17479;     // -> 8124

var client = net.connect({port:remote_server_port,host:remote_server}, function() { //'connect' listener
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

client.on('error', function(err) {
    console.log(err);
});

client.on('end', function() {
    console.log('disconnected from server');
});
