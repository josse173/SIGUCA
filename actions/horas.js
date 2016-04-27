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
                ///--------------------------------------------------//
                //Cálculo de horas trabajadas
                var marcas = util.clasificarMarcas(arrayMarcas);
                var tiempoTotal = util.contarHoras(marcas.entrada, marcas.salida);
                var tiempoAlmuerzo = util.contarHoras(marcas.almuerzoOut, marcas.almuerzoIn);
                tiempoTotal = util.ajustarHoras(tiempoTotal, tiempoAlmuerzo);
                for(receso in marcas.recesos){
                    var tiempoReceso = util.contarHoras(
                        marcas.recesos[receso].recesoOut, 
                        marcas.recesos[receso].recesoIn);
                    tiempoTotal = util.ajustarHoras(tiempoTotal, tiempoReceso);
                }
                //------------------------------------------------------------//
                res.json(tiempoTotal);
            }
        });
        //
    }
}





