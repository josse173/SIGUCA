/** SIGUCA 
 *
 *  Modelo de Marca
 *
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose'),
    deepPopulate = require('mongoose-deep-populate');

//Crear el esquema de Marca
var SchemaMarca = new Schema({
    fechaHora:{
        type: Number,
        default: ""
    },
    tipoMarca: {
        type: String,
        default: "Entrada" //Entrada-salida-salidaReceso-EntradaReceso-salidaAlmuerzo-entradaAlmuerzo
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    epoch: { // Unix Time, es la cantidad de segundos a partir del 01-01-1970
        type: Number,
        default: 0
    },
});

SchemaMarca.plugin(deepPopulate, {whitelist: ['usuario.horario']});

module.exports = mongoose.model('Marca', SchemaMarca);
