/** SIGUCA 
 *
 *  Modelo de Marca
 *
 */


var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');
//Crear el esquema de Marca
var SchemaMarca = new Schema({
    dia: {
        type: Number,
        default: 0
    },
    mes: {
        type: Number,
        default: 0
    },
    ano: {
        type: Number,
        default: 0
    },
    tipoMarca: {
        type: String,
        default: "Entrada" //Entrada-salida-salidaReceso-EntradaReceso-salidaAlmuerzo-entradaAlmuerzo
    },
    estado: {
        type: String,
        default: "Normal" //Normal-Omision-Tardia
    },
    hora: {
        type: Number,
        default: 0
    },
    minutos: {
        type: Number,
        default: 0
    },
    segundos: {
        type: Number,
        default: 0
    },

    codTarjeta: {
        type: Number,
        default: 0
    },

});

SchemaMarca.plugin(passportLocalMongoose);

module.exports = mongoose.model('Marca', SchemaMarca);