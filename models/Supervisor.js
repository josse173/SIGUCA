/** SIGUCA 
 *
 *  Modelo de Supervisor
 *
 */


var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
  passportLocalMongoose = require('passport-local-mongoose');
//Crear el esquema de supervisor
var SchemaSupervisor = new Schema({
    nombre: { type: String, default: '' },
    apellido1: { type: String, default: '' },
    apellido2: { type: String, default: '' },
    email: { type: String, default: '' },
    cedula: { type: Number, default: 0 },
    codTarjeta: { type: Number, default: 0 },
    //area: {type : Schema.ObjectId, ref : 'Area'},
    area: { type : String, default: ''},
});

SchemaSupervisor.plugin(passportLocalMongoose);

module.exports = mongoose.model('Supervisor', SchemaSupervisor);