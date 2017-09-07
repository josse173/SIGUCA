var config = require("../config");
module.exports = {
	login : function (req, res) {
		req.session.name = req.user.tipo+"";
		global.globalTipoUsuario = req.user.tipo+"";  
		
		if (req.session.name == "Administrador") {
			res.redirect('/escritorioAdmin');
		}
		if (req.session.name == "Supervisor") {
			res.redirect('/escritorio');
		}
		if (req.session.name == "Empleado" || req.session.name == config.empleadoProfesor) {
			res.redirect('/escritorioEmpl');
		}
		if (req.session.name == config.empleado2) {
			res.redirect('/');
		}
	},
    logout : function (req, res) {
        req.logout();
        res.redirect('/');
    }
}