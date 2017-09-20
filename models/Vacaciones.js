/** SIGUCA 
 *
 *  Modelo de vacaciones
 *
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//Crear el esquema de Vacaciones
var SchemaVacaciones = new Schema({ 
    disponibles: {
        type: Number,
        default: 0
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }
});

module.exports = mongoose.model('Vacaciones', SchemaVacaciones);
