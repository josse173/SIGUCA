/** SIGUCA 
 *
 * Modelo de Auxiliar
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchemaAuxiliar = new Schema({
    value: {
        usuario: {
	        _id: {
		        type: Schema.ObjectId,
		        ref: 'Usuario'
		    },
		    departamentos: [{
		        departamento: {
		            type: Schema.ObjectId,
		            ref: 'Departamento'
		        }
		    }],
	        count: {
		        type: Number,
		        default: 0
		    }
	    },
        count: {
	        type: Number,
	        default: 0
	    },
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
    }
});

module.exports = mongoose.model('Auxiliar', SchemaAuxiliar);