/** SIGUCA 
 *
 * Modelo de Marcas
 *
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectIdEmpleado = Schema.Types.ObjectId;
var ObjectIdMarca = Schema.Types.ObjectId;
var ObjectIdEvento = Schema.Types.ObjectId;

//Crear el modelo de roles
var SchemaEmpleado = new Schema({
	id: ObjectIdEmpleado, // Llave primaria
	nombre: String,
	apellido1: String,
	apellido2: String,
	cedula: String,
	idCategoria: String,
	codTarjeta: String,
	Justificaciones: {
		idMarca: String,
		comentario: String,
		aprobadoPor: Number,
   }
   Marca: {
		idMarca: ObjectIdMarca,
		hora: Date,
		tipoMarca: Boolean,
   }
   Eventos: {
		idEvento: ObjectIdEvento,
		tipoEvento: Boolean,
   }
});

mongoose.model('Empleado', SchemaEmpleado);