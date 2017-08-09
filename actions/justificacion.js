var moment = require('moment');
var crudJustificaciones = require('../routes/crudJustificaciones');
var config 			= require('../config');
var Justificaciones = require('../models/Justificaciones');
 var util = require('../util/util');
module.exports = {
	edit:function (req, res) {
		crudJustificaciones.loadJust(req.params.id, function(just) { 
			res.json(just);
		}); 
	},
	nueva : function (req, res) {
		var just = req.body; 
		just.id = req.user.id;
		//console.log(just);
		crudJustificaciones.addJust(just, function (){
			if (req.session.name == "Empleado" || req.session.name == config.empleadoProfesor) {
				res.redirect('/escritorioEmpl');
			} else res.redirect('/escritorio');
        });///verificar
	},
	actualiza: function (req, res) {
		var just = req.body; 
		just.id = req.params.id;
		just.usuario = req.user.id;
		crudJustificaciones.updateJust(just, function (err){
			res.redirect('/eventos');
		});
	},
	_delete : function (req, res) {
		var id = req.params.id;
		crudJustificaciones.deleteJust(id, function (err, msj) {
			if(err) res.json(err);
			else res.send(msj);
		});
	},

	justificacionEnMasa:function(req,res){
		var epochTime = moment().unix();
        var detalle = (req.body.detalle);
        console.log(detalle);

        var justificacionActualizada = {
                detalle: detalle,
                estado: "Pendiente",
                fechaJustificada:epochTime
        };
        Justificaciones.find( {usuario: req.user.id, estado:'Incompleto'}
        ).exec(function(err, justificaciones) {
        var arrayJust = util.unixTimeToRegularDate(justificaciones, true);
        for(temporal in arrayJust){
             Justificaciones.findByIdAndUpdate(arrayJust[temporal]._id, justificacionActualizada, function (err, justActualizada) {
        
            });
		}
		
	
		
		});
		res.redirect('/escritorioEmpl');

	}

}