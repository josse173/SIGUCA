  /** SIGUCA 
 *
 * 	Modelo de Departamento
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//Crear el esquema de Departamento
var SchemaDepartamento = new Schema({
		nombre: { type: String, default: '' },
		idSupervisor: {type : Schema.ObjectId, ref : 'Usuario'},
		tipoJornada: { type: String, default: 'Fija' }, // Fija - Horas - Excepción
		horario: {
			tipo: { type: String, default: 'Diurna' }, // Diurna - Mixta - Nocturna - Excepción
			horaEntrada: { type: Number, default: 7 },
			horaSalida: { type: Number, default: 3 },
		}
}

module.exports = mongoose.model('Departamento', SchemaDepartamento);