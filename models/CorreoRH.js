
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//Crear el esquema de Correos
var SchemaCorreo = new Schema({
    correo: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('CorreoRH', SchemaCorreo);
