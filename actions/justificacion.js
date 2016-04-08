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
	edit:function (req, res) {
		crud.loadJust(req.params.id, function(just) { 
			res.json(just);
		}); 
	},
	nueva : function (req, res) {
		var just = req.body; 
		just.id = req.user.id;
		crud.addJust(just, function (){
			if (req.session.name == "Empleado") {
				res.redirect('/escritorioEmpl');
			} else res.redirect('/escritorio');
        });//verificar
	},
	actualiza: function (req, res) {
		var just = req.body; 
		just.id = req.params.id;
		crud.updateJust(just, function (err){
			res.redirect('/eventos');
		});
	},
	_delete : function (req, res) {
		var id = req.params.id;
		crud.deleteJust(id, function (err, msj) {
			if(err) res.json(err);
			else res.send(msj);
		});
	}
}