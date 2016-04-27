/** SIGUCA 
 *
 *  Modelo de Justificacion
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//Crear el esquema de justificación
var SchemaJustificacion = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    fechaCreada: { // epoch
        type: Number,
        default: 0
    },
    motivo: {
        type: String,
        default: '' //Tardia - Omision de marca
    },
    detalle: {
        type: String,
        default: ''
    },
    estado: {
        type: String,
        default: 'Pendiente'
    }, // Pendiente - Aceptado - Rechazado -Incompleta    
    comentarioSupervisor: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('Justificaciones', SchemaJustificacion);