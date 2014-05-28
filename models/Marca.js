/** SIGUCA 
 *
 *  Modelo de Marca
 *
 */


var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');
//Crear el esquema de Marca
var SchemaMarca = new Schema({
<<<<<<< HEAD
    fecha: ({
      dia: { type: Number, default: 0 },
      mes: { type: Number, default: 0 },
      ano: { type: Number, default: 0 }
    }), 
    horaMarca: ({
      hora: { type: Number, default: 0 },
      minutos: { type: Number, default: 0 },
      segundos: { type: Number, default: 0 }
    }),
    codTarjeta: { type: String, default: 0 },
    // horaEntrada: ({
    //   hora: { type: Number, default: 0 },
    //   minutos: { type: Number, default: 0 },
    //   segundos: { type: Number, default: 0 }
    // }),
    // horaSalida: ({
    //   hora: { type: Number, default: 0 },
    //   minutos: { type: Number, default: 0 },
    //   segundos: { type: Number, default: 0 }
    // }),
    // horaSalidaReceso: ({
    //   hora: { type: Number, default: 0 },
    //   minutos: { type: Number, default: 0 },
    //   segundos: { type: Number, default: 0 }
    // }),
    // horaEntradaReceso: ({
    //   hora: { type: Number, default: 0 },
    //   minutos: { type: Number, default: 0 },
    //   segundos: { type: Number, default: 0 }
    // }),
    // horaSalidaAlmuerzo: ({
    //   hora: { type: Number, default: 0 },
    //   minutos: { type: Number, default: 0 },
    //   segundos: { type: Number, default: 0 }
    // }),
    // horaEntradaAlmuerzo: ({
    //   hora: { type: Number, default: 0 },
    //   minutos: { type: Number, default: 0 },
    //   segundos: { type: Number, default: 0 }
    // }),    
=======
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
        type: Number,
        default: 0
    },

>>>>>>> dc5e6a90856937ab285c1a9cdeb079e3a88aab55
});

SchemaMarca.plugin(passportLocalMongoose);

module.exports = mongoose.model('Marca', SchemaMarca);