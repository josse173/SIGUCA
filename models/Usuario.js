 /**
  *
  *     SIGUCA:
  * Esquema de Usuario
  *
  **/

 var mongoose = require('mongoose'),
     Schema = mongoose.Schema,
     passportLocalMongoose = require('passport-local-mongoose');

 var SchemaUsuario = new Schema({
     codTarjeta: {
         type: Number,
         default: 0
     },
     usuario : {
         type: String,
         default: ''
     },
     tipo : {
         type: String,
         default: ''
     },
     estado: {
         type: String,
         default: 'Activo'
     }, //Activo, Inactivo
     nombre: {
         type: String,
         default: ''
     },
     apellido1: {
         type: String,
         default: ''
     },
     apellido2: {
         type: String,
         default: ''
     },
     email: {
         type: String,
         default: ''
     },
     cedula: {
         type: Number,
         default: 0
     },
     fechaCreacion: {
         type: Date,
         default: Date.now()
     },
     departamentos: [{
         departamento: {
            type: Schema.ObjectId,
            ref: 'Departamento'
        }
     },{_id:false}],
     horario: {
         type: Schema.ObjectId,
         ref: 'Horario'
     },
 });

 SchemaUsuario.plugin(passportLocalMongoose);

 module.exports = mongoose.model('Usuario', SchemaUsuario);