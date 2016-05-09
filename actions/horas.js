var moment = require('moment');
var Marca = require('../models/Marca');
var Usuario = require('../models/Usuario');
var Horario = require('../models/Horario');
var Departamento = require('../models/Departamento');
var Justificaciones = require('../models/Justificaciones');
var Solicitudes = require('../models/Solicitudes');
var Cierre = require('../models/Cierre');
var util = require('../util/util');
var crud = require('../routes/crud');

module.exports = {
    horasTrabajadas: function (req, res) { 
        var epochGte = moment();
        epochGte.hours(0);
        epochGte.minutes(0);
        epochGte.seconds(0);
        //console.log(epochGte.unix());      
        var actualEpoch = moment();
        Marca.find( 
        {
            usuario: req.user.id, 
            epoch:{"$gte": epochGte.unix()}
        },
        {_id:0,tipoMarca:1,epoch:1}
        ).exec(
        function(error, arrayMarcas) {
            if (!error){
                res.json(util.tiempoTotal(util.clasificarMarcas(arrayMarcas)));
            }
        });
        //
    }
}





