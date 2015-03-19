/** SIGUCA 
 *
 *  Modelo de Horario
 *  Schedule model
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var SchemaHorario = new Schema({
    nombre: {
        type: String,
        default: ''
    },
    horaEntrada: {
        type: String,
        default: '8:00'
    },
    horaSalida: {
        type: String,
        default: '17:00'
    },
    rangoJornada: { //horas a trabajar por dia
        type: Number,
        default: 6
    },
    tiempoReceso: {
        type: String,
        default: '45m'
    },
    tiempoAlmuerzo: {
        type: String,
        default: '1h'
    }/*,
    tipoHorario: { //Fijo-Horas
        type: String,
        default: 'Fijo'
    }*/
});

module.exports = mongoose.model('Horario', SchemaHorario);