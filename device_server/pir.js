/**
 * Created by bruce on 16/1/1.
 */


// PIR 人体红外传感器

var wpi = require('wiring-pi');

var GPIO_PIR_PIN = 10;


function initPIRSenosr() {
    wpi.pinMode(GPIO_PIR_PIN, wpi.INPUT);
    //wpi.digitalWrite(GPIO_PM2_5, 0);
}

initPIRSenosr();






