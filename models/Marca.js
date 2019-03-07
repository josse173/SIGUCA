/** SIGUCA 
 *
 *  Modelo de Marca
 *
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//Crear el esquema de Marca
var SchemaMarca = new Schema({ 
    tipoMarca: {
        type: String,
        default: "Entrada" //Entrada-salida-salidaReceso-EntradaReceso-salidaAlmuerzo-entradaAlmuerzo
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    epoch: { // Unix Time, es la cantidad de segundos a partir del 01-01-1970
        type: Number,
        default: 0
    },
    tipoUsuario: { // En el caso de que el usuario tenga varios roles, aquí se va a especificar el tipo al cual pertenece esta marca
        type: String,
        default: ""
    },
    ipOrigen: { // Si es de la pi almacena la ip, si es otro dispositivo mac address, dispositivos iphone se estan omitiendo
        type: String,
        default: "Ip desconocida"
    },
    dispositivo: { // Dispositivo desde el que se realiza la marca
        type: String,
        default: ""
    },
    red: { // Dispositivo desde el que se realiza la marca
        type: String,
        default: ""
    },
    epochMarcaEntrada:{ //relacionado con la marca inicial, si es que existe, utilizado unicamente con el cierre automatico
        type: Number,
        default: 0
    },
    epochCreacion:{
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Marca', SchemaMarca);
