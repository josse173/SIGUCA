var moment = require('moment');
var crudJustificaciones = require('../routes/crudJustificaciones');

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
			if (req.session.name == "Empleado") {
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
	}
}