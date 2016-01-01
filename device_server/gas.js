/**
 * Created by bruce on 16/1/1.
 */

// 煤气传感器
// 低电平发生警报
var wpi = require('wiring-pi');

var GPIO_GAS_PIN = 29;
var GPIO_GAS_COUNT = 2;

function initGASSenosr() {
    wpi.pinMode(GPIO_GAS_PIN, wpi.INPUT);

    // 稍等一会儿
    setTimeout(checkGASSensor, 5000);
}

var lowCount = 0;
function checkGASSensor() {
    var pinValue = wpi.digitalRead(GPIO_GAS_PIN);
    if (pinValue == wpi.LOW) {
        lowCount++;
        if (lowCount == GPIO_GAS_COUNT) {
            // TODO: 煤气泄漏，发送警报
            console.log('GAS warning');
            lowCount = 0;

            // 3分钟后再进行检查
            setTimeout(checkGASSensor, 3*60*1000);
        }
    } else {
        lowCount = 0;
    }

    setTimeout(checkGASSensor, 1000);
}

module.exports = initGASSenosr;
