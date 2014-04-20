  /** SIGUCA 
 *
 * 	Modelo de Horario
 *  Schedule model
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchemaHorario = new Schema({
		
		nombre: { type: String, default: '' },
		horaEntrada: { type: String, default: '8:00' }, 
		horaSalida: { type: String, default: '17:00'},
		horaInAlmuerzo: {type: String, default: '12:00'},
		horaFnAlmuerzo: {type: String, default: '13:00'},
		rangoReceso: {type: String, default: '45m'}
});

module.exports = mongoose.model('Horario', SchemaHorario);