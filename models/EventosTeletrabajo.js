/** SIGUCA
 *
 *  Modelo de Eventos Teletrabajo
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchemaEventosTeletrabajo = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    nombreUsuario:{
      type: String,
      default: ''
    },
    fecha: {
        type: Date,
        default: Date.now()
    },
    epoch: {
        type: Number,
        default: 0
    },
    fechaAceptacion: {
        type: Date,
        default: null
    },
    presente: {
        type: Boolean,
        default: false
    }
}, { collection: 'eventosTeletrabajo' });

module.exports = mongoose.model('EventosTeletrabajo', SchemaEventosTeletrabajo);
