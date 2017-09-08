 /**
  *
  *     SIGUCA:
  * Esquema de Usuario
  *
  **/
//
var mongoose = require('mongoose'),
Schema = mongoose.Schema,
passportLocalMongoose = require('passport-local-mongoose'),
bcrypt   = require('bcrypt-nodejs');

var SchemaUsuario = new Schema({
  codTarjeta: {
   type: Number,
   default: 0
 },
 username : {
   type: String,
   default: ''
 },
 password : {
   type: String,
   default: ''
 },
 tipo : [
    {
        type: String,
        default: ''
    }
  ],
 estado: {
   type: String,
   default: 'Activo'
 },
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
 horarioEmpleado: {
   type: Schema.ObjectId,
   ref: 'HorarioEmpleado'
 },
 horario: {
   type: Schema.ObjectId,
   ref: 'Horario'
 },
  horarioFijo: {
   type: Schema.ObjectId,
   ref: 'horarioFijo'
 },
 departamentos: [
    {//
      departamento: {
        type: Schema.ObjectId,
        ref: 'Departamento'
      }
    },
    {_id:false}]
  });

SchemaUsuario.plugin(passportLocalMongoose);

// methods ======================
// generating a hash
SchemaUsuario.statics.generateHash = function(password) {
  return bcrypt.hashSync(password);
};

// checking if password is valid
SchemaUsuario.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Usuario', SchemaUsuario);