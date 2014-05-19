/** SIGUCA 
 *
 * 	Modelo de Empleado
 *
 */


var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
 	passportLocalMongoose = require('passport-local-mongoose');
//Crear el esquema de Empleado
var SchemaEmpleado = new Schema({
		nombre: { type: String, default: '' },
		apellido1: { type: String, default: '' },
		apellido2: { type: String, default: '' },
		email: { type: String, default: '' },
		cedula: { type: Number, default: 0 },
		codTarjeta: { type: String, default: '' },
		departamento: {type : Schema.ObjectId, ref : 'Departamento'},
		horario: {type : Schema.ObjectId, ref : 'Horario'},
		justificaciones: [{
			fecha: Date,
			comentario: { type: String, default: '' },
			estado: { type: Number, default: 0 }, // Pendiente - Aceptado - Rechazado
			resolucionPor: {type : Schema.ObjectId, ref : 'Usuario'},
		}],
		
		jornadas: [{
			horaEntrada: Date,
			horaSalida: Date,
			marcaEntrada: Date,
			marcaSalida: Date,
			horaExtraEntrada: Date,
			horaExtraSalida: Date,
			receso: [{ 
				marcaSalida: Date,
				marcaEntrada: Date,
			}],
		}]
}
/*, { autoIndex: false }*/); // Para cuando se ponga en producción
/*SchemaEmpleado.path('nombre').validate(function (nombre) {
  if (authTypes.indexOf(this.provider) !== -1) return true
  return nombre.length
}, 'Nombre no puede estar en blanco')

SchemaEmpleado.path('idCategoria').validate(function (idCategoria) {
  if (authTypes.indexOf(this.provider) !== -1) return true
  return idCategoria.length
}, 'ID de la Categoría no puede estar en blanco')

SchemaEmpleado.path('email').validate(function (email) {
  if (authTypes.indexOf(this.provider) !== -1) return true
  return email.length
}, 'Email no puede estar en blanco')

SchemaEmpleado.path('email').validate(function (email, fn) {
  var User = mongoose.model('User')
  
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) fn(true)

  // Check only when it is a new user or when email field is modified
  if (this.isNew || this.isModified('Empleado')) {
    User.find({ Empleado: empleado }).exec(function (err, empleados) {
      fn(!err && empleados.length === 0)
    })
  } else fn(true)
}, 'Email ya existe')*/

/**
* Pre-save hook


SchemaEmpleado.pre('save', function(next) {
  if (!this.isNew) return next()
})*/
SchemaEmpleado.plugin(passportLocalMongoose);

module.exports = mongoose.model('Empleado', SchemaEmpleado);
//Empleado.ensureIndexes(callback); // Para cuando se ponga en producción