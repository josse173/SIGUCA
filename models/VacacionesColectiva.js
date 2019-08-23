/** SIGUCA
 *
 *  Modelo de Vacaciones Colectivas
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchemaVacacionesColectivas = new Schema({
    fechaCreacion: {
        type: Number,
        default: Date.now()
    },
    nombre: {
        type: String,
        default: ''
    },
    fechaInicialEpoch: {
        type: Number,
        default: 0
    },
    fechaFinalEpoch: {
        type: Number,
        default: 0
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

module.exports = mongoose.model('Periodo', SchemaVacacionesColectivas);
