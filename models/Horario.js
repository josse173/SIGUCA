/** SIGUCA 
 *
 *  Modelo de Horario
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchemaHorario = new Schema({
    nombre: {
        type: String,
        default: ''
    },
    horaEntrada: {
        type: String,
        default: '0:00'
    },
    horaSalida: {
        type: String,
        default: '0:00'
    },
    rangoJornada: { 
        type: String,
        default: '9:00'
    },
    tiempoReceso: {
        type: String,
        default: '0:45'
    },
    tiempoAlmuerzo: {
        type: String,
        default: '1:00'
    },
    tipo: {
        type: String,
        default: 'Fijo'
    }
});

module.exports = mongoose.model('Horario', SchemaHorario);