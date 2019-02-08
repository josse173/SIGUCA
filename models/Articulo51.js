var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchemaArticulo = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    solicitud: {
        type: Schema.Types.ObjectId,
        ref: 'Solicitud'
    },
    tipoSolicitud: {
        type: String,
        default: ''
    },
    inciso:{
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('Articulo', SchemaArticulo);