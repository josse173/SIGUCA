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
        type: Date,
        default: ''
    },
    mostrada:{
        type: Boolean,
        default : false
    }
}, { collection: 'alerta' });

module.exports = mongoose.model('Alerta', SchemaAlerta);
