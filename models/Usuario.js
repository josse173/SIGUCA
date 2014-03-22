 /**
 *
 *		SIGUCA:
 * 		Esquema de Usuario
 *
 **/

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var SchemaUsuario = new Schema({
    usuario: String,
    fecha: Date
});

SchemaUsuario.plugin(passportLocalMongoose);

module.exports = mongoose.model('Usuario', SchemaUsuario);