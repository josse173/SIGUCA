/** SIGUCA 
 *
 *  Modelo de Justificacion
 *
 */


var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');
//Crear el esquema de justificacion
var SchemaJustificacion = new Schema({
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
    tipo: {
        type: String,
        default: 'Justificacion' //Justificacion-Extra
    },
    comentario: {
        type: String,
        default: ''
    },
    estado: {
        type: Number,
        enum: ['Pendiente', 'Aceptado', 'Rechazado']
    }, // Pendiente - Aceptado - Rechazado    
    codTarjeta: {
        type: Number,
        default: 0
    },
    comentarioSupervisor: {
        type: String,
        default: ''
    },
});

SchemaJustificacion.plugin(passportLocalMongoose);

module.exports = mongoose.model('Justificacion', SchemaJustificacion);