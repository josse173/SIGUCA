var crudSolicitud = require('../routes/crudSolicitud');


module.exports = {
	nuevoExtra : function(req, res){
		var extra = req.body; 
		extra.id = req.user.id;
		crudSolicitud.addExtra(extra, function(){
			if (req.session.name == "Empleado") {
				res.redirect('/escritorioEmpl');
			} else res.redirect('/escritorio');
		});
	},
	editar : function (req, res) {
		crudSolicitud.loadSoli(req.params.id, function(soli) { 
			res.json(soli);
		});
	},
	getExtra : function (req, res) {
		var extra = req.body;
		extra.id = req.params.id;
		crudSolicitud.updateExtra(extra, function (err) { 
			res.redirect('/eventos');
		});
	},
	crearPermiso : function (req, res) {
		var permiso = req.body; 
		permiso.usuario = req.user;
		crudSolicitud.addPermiso(permiso, function (){
			if (req.session.name == "Empleado") {
				res.redirect('/escritorioEmpl');
			} else res.redirect('/escritorio');  
		});
	},
	editarPermiso: function (req, res) {
		var permiso = req.body;
		permiso.id = req.params.id;
		crudSolicitud.updatePermiso(permiso, function (err) { 
			res.redirect('/eventos');
		});
	},
	borrarSolicitud:function (req, res) {
        crudSolicitud.deleteSoli(req.params.id, function (err, msj) { 
            if (err) res.json(err);
            else res.send(msj);
        });
    }
}