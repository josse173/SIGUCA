
var mongoose = require('mongoose'),
Schema = mongoose.Schema;

//Crear el esquema de Redes
var SchemaRed = new Schema({ 
nombreRed: {
    type: String,
    default: 'Desconocida'
},

});

module.exports = mongoose.model('Red', SchemaRed);