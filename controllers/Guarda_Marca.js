/** SIGUCA  
* Registro de Marca en la Base de Datos
*
**/

var Marca = require('../models/Marca.js');
// var sleep = require("sleep");
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var serialPort = new SerialPort("/dev/ttyO1", {
  baudrate: 9600,
  parser: serialport.parsers.readline()
}, false); 

serialPort.open(function () {
  console.log('Puerto Serial /dev/ttyO1 Abierto.');
  var subcod;  
  var codigo;
  var tiempo = new Date();
  var current = getDateTime();
  console.log(current);
  serialPort.on("data", function(data) {
    //sleep.sleep(5); // 5 segundos
    subcod = data.substr(5,6); // Toma desde la posición 5 del código, 6 elementos: 590040155458 -> 401554
    subcod = parseInt(subcod,16); // Convierte el código de Hexadecimal a Decimal:  401554 -> 4199764
    console.log('Codigo: 000'  + subcod); // Se imprime el código anteponiendo 3 ceros al inicio para que se muestre igual que en el llavero
    guarda(subcod);
  }); 
});

// Guarda nueva marca
exports.guarda = function(codigo) {
// function guarda(codigo) {
	var date = new Date();
	var marca = Marca({    
			dia: ({
		        date.getUTCDate()    
		    }),
		    mes: ({
		        date.getMonth()
		    }),
		    ano: ({
		        date.getFullYear()
		    }),
		    hora: ({
		        date.getHours()
		    }),
		    minutos: ({
		        date.getMinutes()
		    }),
		    segundos: ({
		        date.getSeconds()
		    }),
		    tipoMarca: ({
				type: String,
				default: "Entrada" //Entrada-salida-salidaReceso-EntradaReceso-salidaAlmuerzo-entradaAlmuerzo
			}),
			estado: ({
				type: String,
				default: "Normal" //Normal-Omision-Tardia
			}),
			codTarjeta: ({ 
				codigo
			})
	});				 
	marca.save(function (err) {
		if (err) throw err;
	});				
}