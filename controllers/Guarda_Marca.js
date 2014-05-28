/** SIGUCA  
 *
 *		API del Empleado
 *				crea - Crea nuevo Empleado
 *				registra - Registra Empleado
 *				buscaPorCedula - Busca a un Empleado por cédula
 *				lista - Lista a todos los Empleados
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
    subcod = data.substr(5,6); // De posición 5, agarra 6 espacios
    subcod = parseInt(subcod,16); // de hexa a deci
    console.log('Codigo: 000'  + subcod);
    guarda();
  }); 
});

// Guarda nueva marca
exports.guarda = function(req, res) {
	var date = new Date();
	var marca = new Marca({    
							dia: {
						        type: Number,
						        default: 0
						    },
						    mes: {
						        type: Number,
						        default: 0
						    },
						    ano: {
						        type: Number,
						        default: 0
						    },
						    tipoMarca: {
						        type: String,
						        default: "Entrada" //Entrada-salida-salidaReceso-EntradaReceso-salidaAlmuerzo-entradaAlmuerzo
						    },
						    estado: {
						        type: String,
						        default: "Normal" //Normal-Omision-Tardia
						    },
						    hora: {
						        type: Number,
						        default: 0
						    },
						    minutos: {
						        type: Number,
						        default: 0
						    },
						    segundos: {
						        type: Number,
						        default: 0
						    },

						    codTarjeta: { 
						    	serialPort.subcod 
						    }
	});				 
	marca.save(function (err) {
		if (err) throw err;
	});				
}
								
