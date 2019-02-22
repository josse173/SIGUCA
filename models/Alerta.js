/** SIGUCA
 *
 *  Modelo de Alerta
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchemaAlerta = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    fechaCreacion: {
        type: Number,
        default: ''
    },
    fechaAlerta: {
        type: Date,
        default: 0
    },
    fechaAlertaUnix: {
        type: Number,
        default: 0
    },
    fechaMostrada: {
        type: Number,
        default: 0
    },
    mostrada:{
        type: Boolean,
        default : false
    }
}, { collection: 'alerta' });

module.exports = mongoose.model('Alerta', SchemaAlerta);
