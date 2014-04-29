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
    fecha: ({
      dia: { type: Number, default: 0 },
      mes: { type: Number, default: 0 },
      ano: { type: Number, default: 0 }
    }), 
    horaEntrada: ({
      hora: { type: Number, default: 0 },
      minutos: { type: Number, default: 0 },
      segundos: { type: Number, default: 0 }
    }),
    horaSalida: ({
      hora: { type: Number, default: 0 },
      minutos: { type: Number, default: 0 },
      segundos: { type: Number, default: 0 }
    }),
    horaSalidaReceso: ({
      hora: { type: Number, default: 0 },
      minutos: { type: Number, default: 0 },
      segundos: { type: Number, default: 0 }
    }),
    horaEntradaReceso: ({
      hora: { type: Number, default: 0 },
      minutos: { type: Number, default: 0 },
      segundos: { type: Number, default: 0 }
    }),
    horaSalidaAlmuerzo: ({
      hora: { type: Number, default: 0 },
      minutos: { type: Number, default: 0 },
      segundos: { type: Number, default: 0 }
    }),
    horaEntradaAlmuerzo: ({
      hora: { type: Number, default: 0 },
      minutos: { type: Number, default: 0 },
      segundos: { type: Number, default: 0 }
    }),
    codTarjeta: { type: Number, default: 0 },
    
});

SchemaMarca.plugin(passportLocalMongoose);

module.exports = mongoose.model('Marca', SchemaMarca);