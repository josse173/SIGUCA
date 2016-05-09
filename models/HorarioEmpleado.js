var mongoose = require('mongoose'),
Schema = mongoose.Schema;
var horarioDia = {
    entrada: {
        type: String,
        default: '0:00'
    },
    salida: {
        type: String,
        default: '0:00'
    }
};
var SchemaHorario = new Schema({
    lunes: horarioDia,
    martes: horarioDia,
    miercoles: horarioDia,
    viernes: horarioDia,
    jueves: horarioDia,
    sabado: horarioDia,
    domingo: horarioDia,
    tiempoReceso: {
        type: String,
        default: '0:45'
    },
    tiempoAlmuerzo: {
        type: String,
        default: '1:00'
    }
},
{ collection:"horariosEmpleado"}
);

module.exports = mongoose.model('HorarioEmpleado', SchemaHorario);