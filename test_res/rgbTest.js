/**
 * Created by bruce on 15/11/12.
 */

var wpi = require('wiring-pi');

// RGB LED
var LED_R = 3;
var LED_G = 0;
var LED_B = 2;

wpi.wiringPiSetup();

var initRGBLed = function() {
    var ret =  wpi.softPwmCreate(LED_R, 100, 100);
    if (ret !== 0) console.log(LED_R + 'init error');    
    ret = wpi.softPwmCreate(LED_G, 100, 100);
    if (ret !== 0) console.log(LED_R + 'init error');
    ret = wpi.softPwmCreate(LED_B, 100, 100);
    if (ret !== 0) console.log(LED_R + 'init error');

    var i = 100;
    setInterval(function() {
        wpi.softPwmWrite(LED_R, i);
        wpi.softPwmWrite(LED_G, i);
        wpi.softPwmWrite(LED_B, i);
        if (i++ == 100) i = 0;
    }, 10);
};

initRGBLed();


