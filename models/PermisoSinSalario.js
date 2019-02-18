/** SIGUCA
 *
 *  Modelo de Permisos sin Salario
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchemaPermisoSinSalario = new Schema({
    fechaCreada: {
        type: Number,
        default: Date.now()
    },
    nombre: {
        type: String,
        default: ''
    },
    numeroPeriodo: {
        type: Number,
        default: 0
    },
    cantidadMeses: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('PermisosSinSalario', SchemaPermisoSinSalario);
