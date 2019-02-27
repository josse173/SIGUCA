
var mongoose = require('mongoose'),
Schema = mongoose.Schema;
var SchemaCierrePersonal = new Schema(
{
    epoch: { 
        type: Number,
        default: 0
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    tipoUsuario: {
        type: String,
        default: ""
    },
    tiempo:{
        horas: {
            type: Number,
            default: 0
        },
        minutos:{
            type: Number,
            default: 0
        }
    },
    epochMarcaEntrada:{ //relacionado con la marca inicial, si es que existe, utilizado unicamente con el cierre automatico
        type: Number,
        default: 0
    }
},
{ collection:"horasTrabajadas"}
);

module.exports = mongoose.model('CierrePersonal', SchemaCierrePersonal);