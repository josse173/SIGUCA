/** SIGUCA
 *
 *  Modelo de Configuracion
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchemaConfiguracion = new Schema({
    nombreUnico: {
        type: String,
        default: ''
    },
    nombre: {
        type: String,
        default: ''
    },
    valor: {
        type: Number,
        default: 0
    }
}, { collection: 'configuracion' });

module.exports = mongoose.model('Configuracion', SchemaConfiguracion);
