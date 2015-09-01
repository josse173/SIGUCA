/** SIGUCA 
 *
 * Modelo de Temporal
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchemaTemporal = new Schema({
    value: {
        hora: {
	        type: String,
	        default: ''
	    },
        min: {
	        type: String,
	        default: ''
	    },
        tipo: {
	        type: String,
	        default: ''
	    },
        departamento: {
            type: Schema.ObjectId,
            ref: 'Departamento'
        },
        epochEntrada: {
	        type: Number,
	        default: ''
	    },
        epochSalida: {
	        type: Number,
	        default: ''
	    },
    }
});

module.exports = mongoose.model('Temporal', SchemaTemporal);