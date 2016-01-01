/**
 * Created by bruce on 16/1/1.
 */

// PIR 人体红外传感器

var wpi = require('wiring-pi');

// PIR高电平有效
var GPIO_PIR_PIN = 28;
// 连续发生的次数, 防止误报
var GPIO_PIR_COUNT = 2;

function initPIRSenosr() {
    wpi.pinMode(GPIO_PIR_PIN, wpi.INPUT);

    // 稍等一会儿
    setTimeout(checkPIRSensor, 5000);
}

var lowCount = 0;
function checkPIRSensor() {
    var pinValue = wpi.digitalRead(GPIO_PIR_PIN);
    if (pinValue == wpi.HIGH) {
        lowCount++;
        if (lowCount == GPIO_PIR_COUNT) {
            // TODO: 有人出现, 检查是否处在防盗状态
            console.log('People warning');
            lowCount = 0;

            // 已经发送过警报，3分钟后进行下一轮检查
            setTimeout(checkPIRSensor, 3*60*1000);
            return;
        }
    } else {
        lowCount = 0;
    }

    setTimeout(checkPIRSensor, 1000);
}

module.exports = initPIRSenosr;
