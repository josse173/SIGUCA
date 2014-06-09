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
    epoch: { // Unix Time, es la cantidad de segundos a partir del 01-01-1970
        type: Number,
        default: 0
    },
    tipoMarca: {
        type: String,
        default: "Entrada" //Entrada-salida-salidaReceso-EntradaReceso-salidaAlmuerzo-entradaAlmuerzo
    },
    codTarjeta: {
        type: String,
        default: ""
    },
    fecha:{
        type: Date,
        default: ""
    },
});

module.exports = mongoose.model('Marca', SchemaMarca);
