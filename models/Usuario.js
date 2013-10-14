  /** SIGUCA 
 *
 * 	Modelo de Usuario
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//Crear el esquema de Usuario
var SchemaUsuario = new Schema({
		nombre: { type: String, default: '' },
		username: { type: String, default: '' },
		password: { type: String, default: '' },
		rol: { type: String, default: '' },
		email: { type: String, default: '' }
}

module.exports = mongoose.model('Usuario', SchemaUsuario);