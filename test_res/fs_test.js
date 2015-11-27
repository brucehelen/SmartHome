/**
 * Created by missionhealth on 15/11/27.
 */
// temp sensor file path

var TEMP_SENSOR_PATH = '/sys/devices/w1_bus_master1/28-0000051095c9';

var fs = require('fs');

function read_temp() {
    fs.readFile(TEMP_SENSOR_PATH, function (err, data) {
        if (err) throw err;
        console.log(data);
    });
}



