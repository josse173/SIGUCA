/** SIGUCA 
 *
 * Modelo de Departamento
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
passportLocalMongoose = require('passport-local-mongoose');

 //Crear el esquema de Departamento
var SchemaDepartamento = new Schema({
    nombre: {
        type: String,
        default: ''
    }
});

SchemaDepartamento.plugin(passportLocalMongoose);

module.exports = mongoose.model('Departamento', SchemaDepartamento);