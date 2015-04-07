/** SIGUCA 
 *
 *  Modelo de Cierre
 *  Schedule model
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var SchemaCierre = new Schema({
    epoch: { 
        type: Number,
        default: 0
    },
    estado: {
        type: Number,
        default: '0'
    },
    departamento: {
        type: Schema.ObjectId,
        ref: 'Departamento'
    }
});

module.exports = mongoose.model('Cierre', SchemaCierre);