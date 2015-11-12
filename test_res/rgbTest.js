/**
 * Created by bruce on 15/11/12.
 */

var wpi = require('wiring-pi');

// RGB LED
var LED_R = 3;
var LED_G = 0;
var LED_B = 2;

var initRGBLed = function() {
    wpi.softPwmCreate(LED_R, 0, 100);
    wpi.softPwmCreate(LED_G, 0, 100);
    wpi.softPwmCreate(LED_B, 0, 100);

    var i = 0;
    setInterval(function(){
        wpi.digitalWrite(LED_R, i);
        wpi.digitalWrite(LED_G, i);
        wpi.digitalWrite(LED_B, i);
        if (i == 100) i = 0;
    }, 100);
};

initRGBLed();
