/**
 * Created by missionhealth on 16/1/6.
 */

var apn = require('apn');

console.log(__dirname + '/cert.pem');

var options = {
    cert: __dirname + '/cert.pem',              /* Certificate file path */
    key:  __dirname + '/key.pem',               /* Key file path */
    gateway: 'gateway.sandbox.push.apple.com',  /* gateway address gateway.push.apple.com, port 2195*/
    port: 2195                                  /* gateway port */
};
var service = new apn.connection(options);

service.on("connected", function() {
    console.log("Connected");
});

service.on("transmitted", function(notification, device) {
    console.log("Notification transmitted to:" + device.token.toString("hex"));
});

service.on("transmissionError", function(errCode, notification, device) {
    console.error("Notification caused error: " + errCode + " for device ", device, notification);
    if (errCode === 8) {
        console.log("A error code of 8 indicates that the device token is invalid. This could be for a number of reasons - are you using the correct environment? i.e. Production vs. Sandbox");
    }
});

service.on("timeout", function () {
    console.log("Connection Timeout");
});

service.on("disconnected", function() {
    console.log("Disconnected from APNS");
});

service.on("socketError", console.error);

// If you plan on sending identical paylods to many devices you can do something like this.
function serverPushNotification(token, msg) {
    var note = new apn.notification();
    note.setAlertText(msg);
    note.badge = 1;
    note.sound = "default";

    service.pushNotification(note, token);
}

exports.pushNotification = serverPushNotification;
