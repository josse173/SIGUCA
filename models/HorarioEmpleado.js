var mongoose = require('mongoose'),
Schema = mongoose.Schema;
var numberType = {
    type: Number,
    default: 0
};
var tiempo = {
    hora: numberType,
    minutos: numberType
};
var horarioDia = {
    entrada: tiempo,
    salida: tiempo
};
var SchemaHorario = new Schema({
    lunes: horarioDia,
    martes: horarioDia,
    miercoles: horarioDia,
    jueves: horarioDia,
    viernes: horarioDia,
    sabado: horarioDia,
    domingo: horarioDia,
    tiempoReceso: tiempo,
    tiempoAlmuerzo: tiempo
},
{ collection:"horariosEmpleado"}
);

module.exports = mongoose.model('HorarioEmpleado', SchemaHorario);