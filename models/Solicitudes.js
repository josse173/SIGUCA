/** SIGUCA 
 *
 *  Modelo de Solicitudes
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var SchemaSolicitudes = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    tipoSolicitudes: { 
        type: String,
        default: ''
    },
    diaInicio: {
        type: String,
        default: ''
    },
    diaFinal: {
        type: String,
        default: ''
    },
    horaInicio: { 
        type: String,
        default: ''
    },
    horaFinal: { 
        type: String,
        default: ''
    },
    fechaCreada: { //epoch
        type: Number,
        default: 0
    },
    cliente: {
        type: String,
        default: ''
    },
    motivo: {
        type: String,
        default: ''
    },
    detalle: {
        type: String,
        default: ''
    },
    estado: {
        type: String,
        default: 'Pendiente'
    },
    comentarioSupervisor: {
        type: String,
        default: ''
    },
    cantidadHoras: { 
        type: Number,
        default: 0
    },
    cantidadDias: { 
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Solicitudes', SchemaSolicitudes);