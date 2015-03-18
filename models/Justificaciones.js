/** SIGUCA 
 *
 *  Modelo de Justificacion
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

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
        default: 'Justificacion' //Tardia - Omision de marca
    },
    detalle: {
        type: String,
        default: ''
    },
    estado: {
        type: Number,
        enum: ['Pendiente', 'Aceptado', 'Rechazado']
    }, // Pendiente - Aceptado - Rechazado    
    comentarioSupervisor: {
        type: String,
        default: ''
    },
});

SchemaJustificacion.plugin(passportLocalMongoose);

module.exports = mongoose.model('Justificaciones', SchemaJustificacion);