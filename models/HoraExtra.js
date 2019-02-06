/** SIGUCA
 *
 *  Modelo de Horas extra
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchemaHorasExtra = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    fechaCreada: {
        type: String,
        default: ''
    },
    fechaInicial: {
        type: Number,
        default: 0
    },
    fechaFinal: {
        type: Number,
        default: 0
    },
    tiempoSolicitado: {
        type: Number,
        default: ''
    },
    tiempoSolicitadoTexto: {
        type: String,
        default: ''
    },
    ubicacion: {
        type: String,
        default: ''
    },
    motivo: {
        type: String,
        default: ''
    },
    estado: {
        type: String,
        default: 'Pendiente'
    },
    comentarioSupervisor: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('horasExtra', SchemaHorasExtra);
