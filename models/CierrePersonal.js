
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
    tiempo:{
        horas: {
            type: Number,
            default: 0
        },
        minutos:{
            type: Number,
            default: 0
        }
    }
},
{ collection:"horasTrabajadas"}
);

module.exports = mongoose.model('CierrePersonal', SchemaCierrePersonal);