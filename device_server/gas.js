/**
 * Created by bruce on 16/1/1.
 */

// 煤气传感器
// 低电平发生警报
var wpi = require('wiring-pi');
var db = require('./device_db');
var serverPush = require('../server_push/apns');

var GPIO_GAS_PIN = 29;
var GPIO_GAS_COUNT = 2;

function initGASSenosr() {
    wpi.pinMode(GPIO_GAS_PIN, wpi.INPUT);

    // 稍等一会儿
    setTimeout(checkGASSensor, 5000);
}

function sendWarningToUser() {
    db.enablePIRRemotePush({userName: 'Bruce'}, function (err, doc) {
        if (err) {
            console.error('sendWarningToUser ' + err);
        } else if (doc.iOSEnableGASPush === '1') {
            serverPush.pushNotification(doc.iosDeviceToken, '警告: 煤气泄漏, 请立即处理!');
        } else {
            console.log('GAS warning');
        }
    });
}

var lowCount = 0;
function checkGASSensor() {
    var pinValue = wpi.digitalRead(GPIO_GAS_PIN);
    if (pinValue == wpi.LOW) {
        lowCount++;
        if (lowCount == GPIO_GAS_COUNT) {
            // 煤气泄漏，发送警报
            sendWarningToUser();
            lowCount = 0;

            // 3分钟后再进行检查
            setTimeout(checkGASSensor, 3*60*1000);
        }
    } else {
        lowCount = 0;
    }

    setTimeout(checkGASSensor, 1000);
}

function readGASStatus() {
    var pinValue = wpi.digitalRead(GPIO_GAS_PIN);
    if (pinValue == wpi.LOW) {
        return 1;
    } else {
        return 0;
    }
}

exports.initGASSenosr = initGASSenosr;
exports.readGASStatus = readGASStatus;
