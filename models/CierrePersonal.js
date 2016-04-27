
var mongoose = require('mongoose'),
Schema = mongoose.Schema;
var SchemaCierrePersonal = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    epoch: { 
        type: Number,
        default: 0
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
{ collection:"cierresPersonal"}
);

module.exports = mongoose.model('CierrePersonal', SchemaCierrePersonal);