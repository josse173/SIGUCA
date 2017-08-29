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
    rangoJornada: { 
        type: String,
        default: '9:00'
    },
    tiempoReceso: {
        type: String,
        default: '0:15'
    },
    tiempoAlmuerzo: {
        type: String,
        default: '0:45'
    },
    tipo: {
        type: String,
        default: 'Libre'
    }
});

module.exports = mongoose.model('Horario', SchemaHorario);