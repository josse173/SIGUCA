var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/sigucadb');
var Marca = require('../models/Marca.js');
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var serialPort = new SerialPort("/dev/ttyO1", {
  baudrate: 9600,
  parser: serialport.parsers.readline("\03", "ascii")
}, false);

// function sleep(time, callback) {
//     var stop = new Date().getTime();
//     while(new Date().getTime() < stop + time) {
//         ;
//     }
//     callback();
// }

serialPort.open(function () {
  console.log('Puerto Serial /dev/ttyO1 Abierto.');
}); // serialPort.open(function () 


serialPort.on("data", function (data) {
    // Se enciende el puerto serial
    console.log("Puerto Serial Activado");

    // Fecha actual en formato EPOC-UNIX
    var fecha = new Date();
    var epochTime = (fecha.getTime() - fecha.getMilliseconds())/1000;

    // Lectura y conversión del código
    var subcod = data.substr(5,6); // Toma desde la posición 5 del código, 6 elementos: 590040155458 -> 401554
    subcod = parseInt(subcod,16); // Convierte el código de Hexadecimal a Decimal:  401554 -> 4199764
    console.log('Codigo: 000'  + subcod); // Se imprime el código anteponiendo 3 ceros al inicio para que se muestre igual que en el llavero
    // Crea el objeto con la nueva para marca
    var marca = new Marca({
       tipoMarca: "Entrada",
       epoch: epochTime,
       codTarjeta: ("000" + subcod),
    });
   // Guarda la marca en la Base de Datos
   console.log("Guardando la marca en la BD...");
   marca.save(function (err) {
     if (err)
       console.log('Error al guardar la marca en la Base de Datos.');
   }); // marca.save
}); //  serialPort.on("data", function(data) 

