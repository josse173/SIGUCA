
var mongoose = require('mongoose'),
Schema = mongoose.Schema;
var SchemaCierrePersonal = new Schema({
    epoch: { 
        type: Number,
        default: 0
    },
    usuarios: [
    {
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
        },
        solicitudes: [
        {
            
        }
        ]
    }
    ]
},
{ collection:"cierresPersonal"}
);

module.exports = mongoose.model('CierrePersonal', SchemaCierrePersonal);