/**
 * Created by missionhealth on 15/11/10.
 */

var net = require('net');
var fs = require('fs');
var tcp_server_port = require('../settings.js');
// serial
var SerialPort = require("serialport").SerialPort;
// RPI PWM
var wpi = require('wiring-pi');

// 树莓派只有一个串口,默认被用来做console了,需要先禁用
var SERIAL_PORT = '/dev/ttyAMA0';
// G3的数据包长度为24字节
var PACKAGE_LEN = 24;

// RGB LED
var LED_R = 3;
var LED_G = 0;
var LED_B = 2;

// OUTSIDE RGB LED
var LED_OUT_R = 


// DS18B20 -> GPIO7
var TEMP_SENSOR_PATH = '/sys/devices/w1_bus_master1/28-0000051095c9/w1_slave';

var initRGBLed = function() {
    var ret =  wpi.softPwmCreate(LED_R, 100, 100);
    if (ret !== 0) console.log(LED_R + 'init error');
    ret = wpi.softPwmCreate(LED_G, 100, 100);
    if (ret !== 0) console.log(LED_G + 'init error');
    ret = wpi.softPwmCreate(LED_B, 100, 100);
    if (ret !== 0) console.log(LED_B + 'init error');
};

// ---- GPIO ----
wpi.setup('wpi');

// GPIO_PM2_5: 控制PM2.5传感器打开关闭，1-打开，0-关闭
var GPIO_PM2_5 = 4;
wpi.pinMode(GPIO_PM2_5, wpi.OUTPUT);
wpi.digitalWrite(GPIO_PM2_5, 0);

// ---- Serial ----
var serialPort = new SerialPort(SERIAL_PORT, {
    baudrate: 9600
});

// 为了数据处理统一,直接连接本地TCP server
var client;

var serial_package_index = 0;
var serial_package_array = [];

function read_temp() {

}

// 每次读取15个点,前面10个丢弃,后面5个计算平均值并保存到数据库.然后休眠2分钟
var handle_real_pm25 = function(data_package) {
    serial_package_index++;

    if (serial_package_index > 10 && serial_package_index < 15) {
        serial_package_array.push(data_package);
    } else if (serial_package_index == 15) {
        serial_package_array.push(data_package);
        serial_package_index = 0;
        // 关闭PM2.5传感器
        wpi.digitalWrite(GPIO_PM2_5, 0);
        // 计算平均值然后保存数据
        var pm1_0_average = 0, pm2_5_average = 0, pm10_average = 0;
        for (var i = 0; i < serial_package_array.length; i++) {
            var d = serial_package_array[i];
            pm1_0_average += parseInt(d.pm_air_1_0, 10);
            pm2_5_average += parseInt(d.pm_air_2_5, 10);
            pm10_average += parseInt(d.pm_air_10, 10);
        }
        pm1_0_average = pm1_0_average / serial_package_array.length;
        pm2_5_average = pm2_5_average / serial_package_array.length;
        pm10_average = pm10_average / serial_package_array.length;
        console.log(" ---- %d, %d, %d ----", pm1_0_average, pm2_5_average, pm10_average);

        // 控制RGB LED显示不同的值
        rgbLedControl(pm2_5_average);

        // 读取温度
        fs.readFile(TEMP_SENSOR_PATH, function (err, data) {
            var temp_value = 0;

            if (err) {
                console.log(TEMP_SENSOR_PATH + ' read error');
                temp_value = 0;
            } else {
                // 取出温度
                var arraydata = data.toString().split('t=');
                if (arraydata[1]) {
                    temp_value = parseInt(arraydata[1], 10);
                }
            }

            // 将数据保存到数据库
            var data_save = {
                name: "RPi2-inside",
                device_id: "G3-001",
                sensor: [
                    {
                        type: 1,
                        value: temp_value
                    },
                    {
                        type: 3,
                        value: {
                            pm1_0: pm1_0_average,
                            pm2_5: pm2_5_average,
                            pm10: pm10_average
                        }
                    }
                ]
            };

            client.write(JSON.stringify(data_save));

            // 清空数组数据
            serial_package_array.length = 0;
            // 2分钟后再进行下一轮测试
            setTimeout(function () {
                // 打开PM2.5传感器
                wpi.digitalWrite(GPIO_PM2_5, 1);
            }, 2*60*1000);
        });
    }
};

var rgbLedControl = function(pm) {
    var pm2_5 = parseInt(pm, 10);
    if (pm2_5 < 50) {
        wpi.softPwmWrite(LED_G, 0);
        wpi.softPwmWrite(LED_R, 100);
    } else if (pm2_5 < 150) {
        wpi.softPwmWrite(LED_R, parseInt(150 - pm2_5, 10));
        wpi.softPwmWrite(LED_G, 0);
    } else if (pm2_5 >= 150 && pm2_5 < 250) {
        wpi.softPwmWrite(LED_R, 0);
        wpi.softPwmWrite(LED_G, parseInt(pm2_5 - 150, 10));
    } else {        // 显示红色
        wpi.softPwmWrite(LED_R, 0);
        wpi.softPwmWrite(LED_G, 100);
    }
};

var g3 = function() {
    serialPort.on("open", function () {
        console.log(SERIAL_PORT + ' open success');

        // 高电平打开G3传感器
        wpi.digitalWrite(GPIO_PM2_5, 1);

        // 连接TCP服务器
        client_function();

        // 初始化RGB led
        initRGBLed();

        // 处理完整的package
        var handle_package = function(data_package) {
            // data length should be 24bytes
            if (data_package.length !== 24) {
                console.log('data package length[24, %d]', package.length);
                return;
            }

            // check data package length, should be 20
            var package_length = data_package[2] * 256 + data_package[3];
            if (package_length !== 20) {
                console.log('RECV data package length error[20, %d]', package_length);
                return;
            }

            // check CRC
            var crc = 0;
            for (var i = 0; i < data_package.length - 2; i++) {
                crc += data_package[i];
            }
            crc = crc % (256*256);
            var package_crc = data_package[22] * 256 + data_package[23];
            if (package_crc !== crc) {
                console.log('data package crc error[%d, %d]', package_crc, crc);
                return;
            }

            // all is OK, let's get real value
            var index = 4;
            if (data_package[0] === 0x42 && data_package[1] === 0x4d) {
                // PM1.0(CF=1)
                var pm1_0 = data_package[index++] * 256 + data_package[index++];
                // PM2.5(CF=1)
                var pm2_5 = data_package[index++] * 256 + data_package[index++];
                // PM10(CF=1)
                var pm10 = data_package[index++] * 256 + data_package[index++];

                // PM1.0(大气环境下)
                var pm_air_1_0 = data_package[index++] * 256 + data_package[index++];
                // PM2.5(大气环境下)
                var pm_air_2_5 = data_package[index++] * 256 + data_package[index++];
                // PM10(大气环境下)
                var pm_air_10 = data_package[index++] * 256 + data_package[index++];

                handle_real_pm25({
                    pm_air_1_0: pm_air_1_0,
                    pm_air_2_5: pm_air_2_5,
                    pm_air_10: pm_air_10
                });

                // 数据7,8,9保留
            } else {
                console.log('RECV data err: ');
                console.log(data_package);
            }
        };

        var whole_package = new Buffer(PACKAGE_LEN);
        var package_index = 0;
        serialPort.on('data', function(data) {
            for (var i = 0; i < data.length; i++) {
                // check package header
                if (package_index === 0) {
                    if (data[i] === 0x42 && data[i + 1] === 0x4d) {
                        whole_package[package_index++] = data[i];
                    }
                } else if (package_index < PACKAGE_LEN){
                    whole_package[package_index++] = data[i];
                }

                if (package_index === PACKAGE_LEN) {
                    handle_package(whole_package);
                    package_index = 0;
                }
            }
        });
    });

    serialPort.on('error', function(err) {
        console.log('Open serial port error: ' + err);
    });
};

var client_function = function() {
    client = net.connect({port: tcp_server_port.server_listen_port}, function() { //'connect' listener
        console.log('G3: connected to server!');
    });

    client.on('data', function(data) {
        console.log(data.toString());
    });

    client.on('end', function() {
        console.log('G3: disconnected from server');
    });

    client.on('error', function(err) {
        console.log('G3: tcp server, ' + err);
    });
};

module.exports = g3;
