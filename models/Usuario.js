 /** SIGUCA 
 *
 * 	Modelo de Usuario
 *
 **/

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'), // Módulo de encriptación. Para la seguridad de las contraseñas. Algoritmo Hash.
	_ = require('underscore'); // Módulo para poder hacer uso del "_" sin causar conflicto.

// Crear el esquema de Usuario

var SchemaUsuario = new Schema({
		nombre: { type: String, default: '' },
		email: { type: String, default: '' },
		rol: { type: String, default: '' },
		hashed_password: { type: String, default: '' },
		salt: { type: String, default: '' }; // http://en.wikipedia.org/wiki/Salt_%28cryptography%29
}

// Método Virtual: No persiste en la BD.

UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password
    this.salt = this.creaSalt()
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function() { return this._password })
  
 // Validaciones
 
 var validaPresenciaDe = function (valor) {
	return valor && valor.length
}

UserSchema.path('nombre').validate(function (nombre) {
  return nombre.length
}, 'Nombre no puede estar en blanco.')

UserSchema.path('hashed_password').validate(function (hashed_password) {
  return hashed_password.length
}, 'Contraseña no puede estar en blanco.')

UserSchema.path('rol').validate(function (rol) {
  return rol.length
}, 'Rol no puede estar en blanco.')

UserSchema.path('email').validate(function (email) {
  return email.length
}, 'Correo electrónico no puede estar en blanco. Se notificará por medio de este.')

UserSchema.path('email').validate(function(v, fn) {
  var UserModel = mongoose.model('User');

  UserModel.find('email': v.toLowerCase(), function (err, emails) {
    fn(err || emails.length === 0);
  });
}, 'Correo electrónico ya se encuentra registrado.');

// Validación previa a Guardar

UserSchema.pre('guardar', function(next) {
  if (!this.isNew) return next()

  if (!validaPresenciaDe(this.password))
    next(new Error('Contraseña inválida.'))
  else
    next()
})

// Métodos de Usuario

UserSchema.methods = {

  /**
* Autenticar - Verifica si las contraseñas son iguales
*
* @param {String} texto
* @return {Boolean}
* @api public
*/

  autenticar: function (texto) {
    return this.encryptPassword(texto) === this.hashed_password
  },

  /**
* Crea salt
*
* @return {String}
* @api public
*/

  creaSalt: function () {
    return Math.round((new Date().valueOf() * Math.random())) + ''
  },

  /**
* Encripta contraseña
*
* @param {String} password
* @return {String}
* @api public
*/

  encryptPassword: function (password) {
    if (!password) return ''
    var encriptado
    try {
      encriptado = crypto.createHmac('sha1', this.salt).update(password).digest('hex')
      return encriptado
    } catch (err) {
      return ''
    }
  }
}

mongoose.model('Usuario', UserSchema);