/**
 * Created by missionhealth on 15/11/10.
 */

var wpi = require('wiring-pi');
var db = require('./device_db');
var async = require('async');

// INSIDE RGB LED
var LED_R = 3;
var LED_G = 0;
var LED_B = 2;

// OUTSIDE RGB LED
var LED_OUT_R = 12;
var LED_OUT_G = 14;
var LED_OUT_B = 13;

// init inside rgb led
function initRGBLed() {
    var ret =  wpi.softPwmCreate(LED_R, 100, 100);
    if (ret !== 0) console.log(LED_R + ' init error');
    ret = wpi.softPwmCreate(LED_G, 100, 100);
    if (ret !== 0) console.log(LED_G + ' init error');
    ret = wpi.softPwmCreate(LED_B, 100, 100);
    if (ret !== 0) console.log(LED_B + ' init error');
}

// init outside rgb led
function initOutsideRGBLed() {
    var ret =  wpi.softPwmCreate(LED_OUT_R, 100, 100);
    if (ret !== 0) console.log(LED_OUT_R + ' init error');
    ret = wpi.softPwmCreate(LED_OUT_G, 100, 100);
    if (ret !== 0) console.log(LED_OUT_G + ' init error');
    ret = wpi.softPwmCreate(LED_OUT_B, 100, 100);
    if (ret !== 0) console.log(LED_OUT_B + ' init error');
}

function initRGB() {
    initRGBLed();
    initOutsideRGBLed();

    update_sensor();
}

function update_sensor() {

    async.series({
        g3_001: function(callback) {
            // 读取室内G3传感器最新数据
            db.get('G3-001', function(err, db_docs) {
                if (err) {
                    console.error('db read error ' + err);
                    callback(err);
                }

                if (db_docs.length !== 0) {
                    var sensor = db_docs[0].sensor_data.sensor;
                    var pm2_5 = 0;
                    for (sensor_value in sensor) {
                        if (sensor_value.type === 3) {
                            pm2_5 = sensor_value.value.pm2_5;
                        }
                    }
                    rgbLedControl(pm2_5);
                    callback(null, pm2_5);
                } else {
                    console.log('db no records');
                    callback('no records');
                }
            });
        },
        g3_002: function(callback) {
            // 读取室外G3传感器最新数据
            db.get('G3-002', function(err, db_docs) {
                if (err) {
                    console.error('db read error ' + err);
                    callback(err);
                }

                if (db_docs.length !== 0) {
                    var sensor = db_docs[0].sensor_data.sensor;
                    var pm2_5 = 0;
                    for (sensor_value in sensor) {
                        if (sensor_value.type === 3) {
                            pm2_5 = sensor_value.value.pm2_5;
                        }
                    }
                    outsideRgbLedControl(pm2_5);
                    callback(null, pm2_5);
                    callback(null, 'value');
                } else {
                    console.log('db no records');
                    callback('no records');
                }
            });
        }
    }, function(err, results) {
        if (err) {
            console.log(err);
            // 发生错误两分钟更新一次
            setTimeout(function () {
                // 打开PM2.5传感器
                update_sensor();
            }, 2*60*1000);
        } else {
            // 一分钟更新一次
            setTimeout(function () {
                // 打开PM2.5传感器
                update_sensor();
            }, 1*60*1000);
        }
    });
}

// ---- GPIO ----
wpi.setup('wpi');

// inside rgb control
function rgbLedControl(pm) {
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
}

// outside rgb control
function outsideRgbLedControl(pm) {
    var pm2_5 = parseInt(pm, 10);
    if (pm2_5 < 50) {
        wpi.softPwmWrite(LED_OUT_G, 0);
        wpi.softPwmWrite(LED_OUT_R, 100);
    } else if (pm2_5 < 150) {
        wpi.softPwmWrite(LED_OUT_R, parseInt(150 - pm2_5, 10));
        wpi.softPwmWrite(LED_OUT_G, 0);
    } else if (pm2_5 >= 150 && pm2_5 < 250) {
        wpi.softPwmWrite(LED_OUT_R, 0);
        wpi.softPwmWrite(LED_OUT_G, parseInt(pm2_5 - 150, 10));
    } else {        // 显示红色
        wpi.softPwmWrite(LED_OUT_R, 0);
        wpi.softPwmWrite(LED_OUT_G, 100);
    }
}

initRGB();
//exports.initRGB = initRGB;

