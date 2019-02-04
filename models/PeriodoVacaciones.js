/** SIGUCA
 *
 *  Modelo de Solicitudes
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchemaPeriodoVacaciones = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    nombrePeriodo: {
        type: String,
        default: ''
    },
    numeroPeriodo: {
        type: String,
        default: ''
    },
    cantidadDiasRestantes: {
        type: String,
        default: ''
    },
    diasDisfrutados: {
        type: String,
        default: 0
    },
    periodoCompletado: {
        type: Boolean,
        default: 0
    }
});

module.exports = mongoose.model('PeriodoVacaciones', SchemaPeriodoVacaciones);