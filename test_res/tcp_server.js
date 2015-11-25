/**
 * Created by bruce on 15/10/24.
 */

var net = require('net');

// save online devices
global.online_device = {};

var server = net.createServer(function(c) { //'connection' listener
    console.log('client connected');

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

    c.on('end', function() {
        console.log('client disconnected');
    });
    c.on('data', function(data) {
        console.log(data);
    });

    setInterval(function() {
        global.online_device[client].c.write('hello\n');
    }, 1000);

    //c.write('hello\r\n');
    //c.pipe(c);
});

server.listen(20000, function() { //'listening' listener
    console.log('server bound');
});
