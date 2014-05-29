  /** SIGUCA 
   *
   *Modelo de Horario
   *  Schedule model
   */

  var mongoose = require('mongoose'),
      Schema = mongoose.Schema;

  var SchemaHorario = new Schema({

      nombre: {
          type: String,
          default: ''
      },
      tipo: { //Fijo-Horas
          type: String,
          default: 'Fijo'
      },
      horaEntrada: {
          type: String,
          default: '8:00'
      },
      horaSalida: {
          type: String,
          default: '17:00'
      },
      horaInAlmuerzo: { //hora inicio almuerzo
          type: String,
          default: '12:00'
      },
      horaFnAlmuerzo: { //hora finaliza almuerzo
          type: String,
          default: '13:00'
      },
      rangoReceso: {
          type: String,
          default: '45m'
      },
      rangoJornada: { //horas a trabajar por dia
          type: Number,
          default: 6
      }
  });

  module.exports = mongoose.model('Horario', SchemaHorario);