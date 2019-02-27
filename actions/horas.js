var moment = require('moment');
var Marca = require('../models/Marca');
var util = require('../util/util');

module.exports = {
    horasTrabajadas: function (req, res) {
        var epochGte = moment();
        epochGte.hours(0);
        epochGte.minutes(0);
        epochGte.seconds(0);
        //console.log(epochGte.unix());
        var actualEpoch = moment();
        Marca.find( { usuario: req.user.id, epoch:{"$gte": epochGte.unix()}, tipoMarca: "Entrada" , tipoUsuario: req.session.name}, {_id:0, tipoMarca:1, epoch:1} ).exec(
        function(error, arrayMarcas) {
            if (!error){
                res.json(util.tiempoTotal(util.clasificarMarcas(arrayMarcas)));
            }
        });
        //
    }
}





