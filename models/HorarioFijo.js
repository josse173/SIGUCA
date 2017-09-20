var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Dia={
    type:String,
    default:''
};

var SchemahorarioFijo = new Schema({
    nombre: {
        type: String,
        default: ''
    },
    
    Lunes:Dia,
    Martes:Dia,
    Miercoles:Dia,
    Jueves:Dia,
    Viernes:Dia,
    Sabado: Dia,
    Domingo:Dia,

    horaEntrada: { 
        type: String,
        default: '8:00'
    },
    horaSalida: {
        type: String,
        default: '17:00'
    },
    tiempoAlmuerzo: {
        type: String,
        default: '0:45'
    },
    tiempoReceso: {
        type: String,
        default: '0:15'
    },
    tipo: {
        type: String,
        default: 'Fijo'
    }
    
},
{ collection:"horarioFijo"}
);

module.exports = mongoose.model('horarioFijo', SchemahorarioFijo);