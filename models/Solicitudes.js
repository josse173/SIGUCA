/** SIGUCA 
 *
 *  Modelo de Solicitudes
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

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
    /*Inicio: { 
        type: String,
        default: ''
    },
    Termino: { 
        type: String,
        default: ''
    },*/
    epochInicio: { 
        type: Number,
        default: 0
    },
    epochTermino: { 
        type: Number,
        default: 0
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
        type: String,
        default: ''
    },
    cantidadDias: { 
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('Solicitudes', SchemaSolicitudes);