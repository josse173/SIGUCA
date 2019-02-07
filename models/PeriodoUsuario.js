/** SIGUCA
 *
 *  Modelo de Periodos de los usuarios
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchemaPeriodoUsuario = new Schema({
    fechaCreada: {
        type: Number,
        default: ''
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    periodo: {
        type: Schema.Types.ObjectId,
        ref: 'Periodo'
    },
    fechaInicio: {
        type: Number,
        default: ''
    },
    fechaFinal: {
        type: Number,
        default: ''
    },
    diasAsignados: {
        type: Number,
        default: ''
    },
    diasDisfrutados: {
        type: Number,
        default: ''
    }
});

module.exports = mongoose.model('periodoUsuario', SchemaPeriodoSolicitud);
