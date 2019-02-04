/** SIGUCA
 *
 *  Modelo de Periodos y solicitudes
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchemaPeriodoSolicitud = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    solicitud: {
        type: Schema.Types.ObjectId,
        ref: 'Solicitudes'
    },
    periodo: {
        type: Schema.Types.ObjectId,
        ref: 'PeriodoSolicitud'
    },
    cantidadDias: {
        type: String,
        default: ''
    },
    fechaInicio: {
        type: String,
        default: ''
    },
    fechaFinal: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('PeriodoSolicitud', SchemaPeriodoSolicitud);