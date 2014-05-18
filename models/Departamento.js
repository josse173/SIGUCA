  /** SIGUCA 
   *
   * Modelo de Departamento
   *
   */

  var mongoose = require('mongoose'),
      Schema = mongoose.Schema;
  passportLocalMongoose = require('passport-local-mongoose');

   //Crear el esquema de Departamento
  var SchemaDepartamento = new Schema({
      nombre: {
          type: String,
          default: ''
      },
      idSupervisor: {
          type: Schema.ObjectId,
          ref: 'Usuario'
      },
      idHorario: {
          type: Schema.ObjectId,
          ref: 'Horario'
      },
      tipoJornada: {
          type: String,
          default: 'Fija'
      }, // Fija - Horas - Excepción


  });
  SchemaDepartamento.plugin(passportLocalMongoose);
  module.exports = mongoose.model('Departamento', SchemaDepartamento);