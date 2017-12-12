
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//Crear el esquema de Correos
var SchemaCorreo = new Schema({ 
    nombreCorreo: {
        type: String,
        default: ''
    },
    dominioCorreo: {
        type: String,
        default: ''
    },
    password : {
        type: String,
        default: ''
    },
    
});

module.exports = mongoose.model('Correo', SchemaCorreo);