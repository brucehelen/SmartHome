/**
 * Created by missionhealth on 15/10/30.
 */

// 树莓派只有一个串口,默认被用来做console了,需要先禁用
var SERIAL_PORT = '/dev/ttyAMA0';

// serial
var SerialPort = require("serialport").SerialPort;
// RPI PWM
var wpi = require('wiring-pi');

var serialPort = new SerialPort(SERIAL_PORT, {
    baudrate: 9600
});

wpi.setup('wpi');

var pin = 1;
wpi.pinMode(pin, wpi.PWM_OUTPUT);
wpi.pwmWrite(pin, 0);

serialPort.on("open", function () {
    console.log(SERIAL_PORT + ' open success');

    serialPort.on('data', function(data) {
        // data length should be 24bytes
        if (data.length !== 24) {
            console.log('data package length[24, %d]', data.length);
            return;
        }

        // check data package length, should be 20
        var package_length = data[2] * 256 + data[3];
        if (package_length !== 20) {
            console.log('RECV data package length error[20, %d]', package_length);
            return;
        }

        // check CRC
        var crc = 0;
        for (var i = 0; i < data.length - 2; i++) {
            crc += data[i];
        }
        var package_crc = data[22] * 256 + data[23];
        if (package_crc !== crc) {
            console.log('data package crc error[%d, %d]', package_crc, crc);
            return;
        }

        // all is OK, let's get real value
        var index = 4;
        if (data[0] === 0x42 && data[1] === 0x4d) {
            // PM1.0(CF=1)
            var pm1_0 = data[index++] * 256 + data[index++];
            // PM2.5(CF=1)
            var pm2_5 = data[index++] * 256 + data[index++];
            // PM10(CF=1)
            var pm10 = data[index++] * 256 + data[index++];

            console.log('(CF=1) -> [%d, %d, %d]', pm1_0, pm2_5, pm10);

            // PM1.0(大气环境下)
            var pm_air_1_0 = data[index++] * 256 + data[index++];
            // PM2.5(大气环境下)
            var pm_air_2_5 = data[index++] * 256 + data[index++];
            // PM10(大气环境下)
            var pm_air_10 = data[index++] * 256 + data[index++];

            console.log('大气环境 -> [%d, %d, %d]', pm_air_1_0, pm_air_2_5, pm_air_10);

            // 数据7,8,9保留
        } else {
            console.log('RECV data err: ', data.toString());
        }
    });
});

serialPort.on('error', function(err) {
    console.log('Open serial port error: ' + err);
});


