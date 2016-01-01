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
    // 1秒检查一次
    setInterval(checkGASSensor, 1000);
}

var lowCount = 0;
function checkGASSensor() {
    var pinValue = wpi.digitalRead(GPIO_GAS_PIN);
    if (pinValue == wpi.LOW) {
        lowCount++;
        if (lowCount == GPIO_GAS_COUNT) {
            console.log('GAS warning');
            lowCount = 0;
        }
    } else {
        lowCount = 0;
    }
}


module.exports = initGASSenosr;
