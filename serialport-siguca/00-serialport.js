function getDateTime() {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return day + ":" + month + ":" + year + ":" + hour + ":" + min + ":" + sec;

}

var sleep = require("sleep");
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var serialPort = new SerialPort("/dev/ttyO1", {
  baudrate: 9600,
  parser: serialport.parsers.readline()
}, false); 

serialPort.open(function () {
  console.log('Puerto Serial /dev/ttyO1 Abierto.');
  var subcod = "";  
  var codigo = "";
  var tiempo = new Date();
  var current = getDateTime();
  console.log(current);
  serialPort.on("data", function(data) {
    //sleep.sleep(5); // 5 segundos
    subcod = data.substr(5,6);
    subcod = parseInt(subcod,16);
    console.log('Codigo: 000'  + subcod);
  }); 
});
