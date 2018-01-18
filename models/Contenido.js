/** SIGUCA 
 *
 *  Modelo de Contenido
 *
 */

var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var SchemaContenido = new Schema({
titulo: {
    type: String,
    default: ''
},
llave: { 
    type: String,
    default: ''
},
seccion: {
    type: String,
    default: ''
}
});

module.exports = mongoose.model('Contenido', SchemaContenido);