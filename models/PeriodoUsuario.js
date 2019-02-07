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
        default: Date.now()
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
        default: 0
    },
    fechaFinal: {
        type: Number,
        default: 0
    },
    diasAsignados: {
        type: Number,
        default: 0
    },
    diasDisfrutados: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('PeriodoUsuario', SchemaPeriodoUsuario);
