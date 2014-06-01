var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/sigucadb');
var Marca = require('../models/Marca.js');
// var sleep = require("sleep");
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var serialPort = new SerialPort("/dev/ttyO1", {
  baudrate: 9600,
  parser: serialport.parsers.readline("\03", "ascii")
}, false); 

serialPort.open(function () {
  console.log('Puerto Serial /dev/ttyO1 Abierto.');
  var subcod;  
  var codigo;
  var d = new Date();
  var nuevaMarca; 
  serialPort.on("data", function(data) {
    //sleep.sleep(5); // 5 segundos
    subcod = data.substr(5,6); // Toma desde la posición 5 del código, 6 elementos: 590040155458 -> 401554
    subcod = parseInt(subcod,16); // Convierte el código de Hexadecimal a Decimal:  401554 -> 4199764
    console.log('Codigo: 000'  + subcod); // Se imprime el código anteponiendo 3 ceros al inicio para que se muestre igual que en el llavero
  
  var marca = new Marca({ 
     tipoMarca: "Entrada",
     dia: (d.getUTCDate() - 1),
     mes: (d.getMonth() + 1),
     ano: d.getFullYear(),
     hora: d.getHours(),
     minutos: d.getMinutes(),
     segundos: d.getSeconds(),
     codTarjeta: subcod,
  });
  marca.save(function (err) {
    if (err) // ...
    console.log('test');
  });

  }); //  serialPort.on("data", function(data) 
}); // serialPort.open(function () 
