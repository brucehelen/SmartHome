/**
 * Created by bruce on 15/11/12.
 */

var wpi = require('wiring-pi');

// RGB LED
var LED_R = 3;
var LED_G = 0;
var LED_B = 2;

// Initialises wiringPi and assumes that the calling program is going to be using the wiringPi pin numbering scheme.
wpi.wiringPiSetup();

var initRGBLed = function() {
    var ret =  wpi.softPwmCreate(LED_R, 100, 100);
    if (ret !== 0) console.log(LED_R + 'init error');
    ret = wpi.softPwmCreate(LED_G, 100, 100);
    if (ret !== 0) console.log(LED_R + 'init error');
    ret = wpi.softPwmCreate(LED_B, 100, 100);
    if (ret !== 0) console.log(LED_R + 'init error');

    var i = 0;
    setInterval(function() {
        if (i < 100) {
            wpi.softPwmWrite(LED_R, i);
            wpi.softPwmWrite(LED_G, 0);
        } else if (i >= 100 && i < 200) {
            wpi.softPwmWrite(LED_R, 0);
            wpi.softPwmWrite(LED_G, i - 100);
        } else {
            i = 0;
        }
        i++;
    }, 100);
};

initRGBLed();


