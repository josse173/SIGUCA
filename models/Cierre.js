/** SIGUCA 
 *
 *  Modelo de Cierre
 *  Schedule model
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchemaCierre = new Schema({
    epoch: { 
        type: Number,
        default: 0
    },
    estado: {
        type: Number,
        default: 0
    },
    justificaciones: {
        type: Number,
        default: 0
    },
    solicitudes: {
        type: Number,
        default: 0
    },
    marcas: {
        type: Number,
        default: 0
    },
    departamento: {
        type: Schema.ObjectId,
        ref: 'Departamento'
    },
    tipo: {
        type: String,
        default: 'General'
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    horasDiarias: {
        type: Number,
        default: 0
    },
    horasSemanales: {
        type: Number,
        default: 0
    },
    etapa: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Cierre', SchemaCierre);