/** SIGUCA
 *
 *  Modelo de Vacaciones Colectivas por Usuario
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchemaVacacionesColectivasUsuario = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    fechaCreacionEpoch: {
        type: Number,
        default: Date.now()
    },
    fechaCreacion: {
        type: String,
        default: ''
    },
    cantidadDias: {
        type: Number,
        default: 0
    },
    diasAplicados: {
        type: Number,
        default: 0
    },
    diasPendientes: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('VacacionesColectivaUsuario', SchemaVacacionesColectivasUsuario);
