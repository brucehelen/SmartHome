/**
 * Created by bruce on 15/12/22.
 */

var wpi = require('wiring-pi');

// 继电器控制引脚GPIO.6
// 低电平有效
var RELAYS_CONTROL_PIN = 6;

function initRelays() {
    wpi.setup('wpi');
    wpi.pinMode(RELAYS_CONTROL_PIN, wpi.OUTPUT);
    wpi.digitalWrite(RELAYS_CONTROL_PIN, 1);
}

initRelays();

// 继电器控制
// 0 -> 关闭
// 1 -> 打开
function relaysControl(value) {
    if (value === 0) {
        wpi.digitalWrite(RELAYS_CONTROL_PIN, 1);
    } else {
        wpi.digitalWrite(RELAYS_CONTROL_PIN, 0);
    }
}

module.exports = relaysControl;
