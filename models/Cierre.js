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
    fecha: { 
        type: Date,
        default: ''
    },
    epoch: { 
        type: Number,
        default: 0
    },
    estado: {
        type: Number,
        default: '0'
    }
});

module.exports = mongoose.model('Cierre', SchemaCierre);