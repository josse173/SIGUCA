/** SIGUCA
 *
 *  Modelo de Vacaciones Colectivas
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchemaVacacionesColectivas = new Schema({
    nombre: {
        type: String,
        default: ''
    },
    fechaCreacionEpoch: {
        type: Number,
        default: Date.now()
    },
    fechaInicialEpoch: {
        type: Number,
        default: 0
    },
    fechaFinalEpoch: {
        type: Number,
        default: 0
    },
    fechaCreacion: {
        type: String,
        default: ''
    },
    fechaInicial: {
        type: String,
        default: ''
    },
    fechaFinal: {
        type: String,
        default: ''
    },
    cantidadDias: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('VacacionesColectiva', SchemaVacacionesColectivas);
