
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//Crear el esquema de Vacaciones
var SchemaFeriados = new Schema({ 
    nombreFeriado: {
        type: String,
        default: ''
    },
    epoch: { // Unix Time, es la cantidad de segundos a partir del 01-01-1970
        type: Number,
        default: 0
    },
});

module.exports = mongoose.model('Feriados', SchemaFeriados);