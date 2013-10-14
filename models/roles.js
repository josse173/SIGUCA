/** SIGUCA 
 *
 * 		Modelo de roles
 *
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Crear el modelo de roles
var rolesSchema = new Schema({
	rol: {type: String, default: 'activo'},
	nombre: {type: String, default: ''},
});

var presencia = function(value) {
	return value && value.lenght;
};

rolesSchema.path('rol').validate(function(rol){
	return rol.lenght;
}, 'Rol no puede ser nulo');


//TODO: revisar que el nombre sea único (tampoco funciona en no nulo)
rolesSchema.path('nombre').validate(function(nombre){
	console.log('validando nombre de tamaño: '+nombre.length)
	if (nombre.length != 0) 
		return nombre.lenght;
	console.log('validando nombre de tamaño: '+nombre.length+' Luego del return')
}, 'Nombre no puede ser nulo');

mongoose.model('Rol', rolesSchema);
