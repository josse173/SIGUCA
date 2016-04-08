
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
	escritorio : function (req, res) {
		if (req.session.name == "Supervisor") {
			var epochGte = moment().hours(0).minutes(0).seconds(0);

			var epochYesterday = moment().subtract(1, 'days').hours(23).minutes(59).seconds(59);

			Marca.find({usuario: req.user.id, epoch:{"$gte": epochGte.unix()}},{_id:0,tipoMarca:1,epoch:1}).exec(function(error, marcas) {
				Justificaciones.find({estado:'Pendiente'}).populate('usuario').exec(function(error, justificaciones) {
					Solicitudes.find({estado:'Pendiente'}).populate('usuario').exec(function(error, solicitudes) {                        
						Usuario.find({_id:req.user.id},{_id:0,departamentos: 1}).populate('departamentos.departamento').exec(function(error, result){
							Cierre.find({usuario: req.user.id, epoch:{"$gte": epochYesterday.unix() }},{_id:0,horasSemanales:1}).exec(function(err, cierres) {

								result.forEach(function(supervisor){
									var sup = {departamentos: [1]};

									var arrayMarcas = util.eventosAjuste(marcas, sup, "escritorioEmpl");

									var array = [];
									for(var y = 0; y < req.user.departamentos.length; y++){
										array.push(req.user.departamentos[y].departamento);
									}

									just = util.eventosAjuste(justificaciones, req.user, "count");
									soli = util.eventosAjuste(solicitudes, req.user, "count");

									var horasSemanales;
									(epochGte.day() === 1) ? horasSemanales = 0 : (cierres.length == 0) ? horasSemanales = '' : horasSemanales = cierres[0].horasSemanales;

									if (error) return res.json(error);
									return res.render('escritorio', {
										title: 'Escritorio Supervisor | SIGUCA',
										departamentos: supervisor.departamentos, 
										justificaciones: just, 
										solicitudes: soli,
										todos: array,
										usuario: req.user,
										marcas: marcas,
										horasSemanales: horasSemanales
									});
                                });//Supervisor
                            });//Horas Semanales
                        });//Departamentos    
                    });//solicitudes
                });//Justificaciones
            });//Marcas
			//
		} else {
			req.logout();
			res.redirect('/');
		}
	},
	escritorioEmpl : function (req, res) {
		if (req.session.name == "Empleado") {
        	//Se toma la hora actual
        	var epochGte = moment();
        	epochGte.hours(0);
        	epochGte.minutes(0);
        	epochGte.seconds(0);

        	var actualEpoch = moment();

	        //Se busca en la base de datos todas las marcas realizadas por el usuario
	        //
	        //console.log(req.user.id);
	        Marca.find(
	        	{usuario: req.user.id, epoch:{"$gte": epochGte.unix()}},
	        	{_id:0,tipoMarca:1,epoch:1}
	        	).exec(
	        	function(error, marcas) {
	        		if (error) return res.json(error);
                //Se busca en la base de datos las marcas del mismo día
                var supervisor = {departamentos: [1]};
                var arrayMarcas = util.eventosAjuste(marcas, supervisor, "escritorioEmpl");
                return res.render('escritorio', {
                	title: 'Escritorio Empleado | SIGUCA',
                	usuario: req.user, 
                	marcas: arrayMarcas
                });
            });
	    	//
	    } else {
	    	req.logout();
	    	res.redirect('/');
	    }
	},
	escritorioAdmin : function (req, res) {
		if (req.session.name ==="Administrador") {
			Horario.find().exec(function(error, horarios) {
				Departamento.find().exec(function(error, departamentos) {

					if (error) return res.json(error);
					return res.render('escritorio', {
						title: 'Escritorio Administrador | SIGUCA',
						usuario: req.user,
						horarios: horarios,
						departamentos: departamentos
					});
				});
			});
		} else {
			req.logout();
			res.redirect('/');
		}
	}
};
