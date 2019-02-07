/** SIGUCA
 *
 *  Modelo de Solicitudes
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchemaPeriodo = new Schema({
    fechaCreada: {
        type: Number,
        default: 0
    },
    nombre: {
        type: String,
        default: ''
    },
    numeroPeriodo: {
        type: Number,
        default: 0
    },
    rangoInicial: {
        type: Number,
        default: 0
    },
    rangoFinal: {
        type: Number,
        default: 0
    },
    cantidadDias: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Periodo', SchemaPeriodo);
