function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var serialPort = new SerialPort("/dev/ttyO1", {
  baudrate: 9600,
  parser: serialport.parsers.readline()
}); 

serialPort.on('open', function () {
  console.log('Puerto Serial /dev/ttyO1 Abierto.');
});

serialPort.on('data', function(data) {
    console.log("Codigo: " +data);
    
});


/*

0000040   .  \n 002  \n   5  \n   9  \n   0  \n   0  \n   4  \n   0  \n
0000060   1  \n   5  \n   5  \n   4  \n   5  \n   8  \n 003  \n 002  \n
0000100   5  \n   9  \n   0  \n   0  \n   4  \n   0  \n   1  \n   5  \n
0000120   5  \n   4  \n   5  \n   8  \n 003  \n 002  \n   5  \n   9  \n
0000140   0  \n   0  \n   4  \n   0  \n   1  \n   5  \n   5  \n   4  \n

*/
