
var moment = require('moment');
var Marca = require('../models/Marca');
var Contenido = require('../models/Contenido');
var Usuario = require('../models/Usuario');
var Horario = require('../models/Horario');
var Departamento = require('../models/Departamento');
var Justificaciones = require('../models/Justificaciones');
var Solicitudes = require('../models/Solicitudes');
var Cierre = require('../models/Cierre');
var CierrePersonal = require('../models/CierrePersonal');
var util = require('../util/util');
var crud = require('../routes/crud');
var crudUsuario = require('../routes/crudUsuario');
var crudJustificaciones = require('../routes/crudJustificaciones');
var config 			= require('../config');
var HorarioFijo = require('../models/HorarioFijo');
var HorarioPersonalizado = require('../models/HorarioEmpleado');
module.exports = {
	escritorio : function (req, res) {
		var conteoJustificacionesTotal=0;
		req.user.tipo = req.session.name;
		if (req.session.name == "Supervisor") {
			var epochGte = moment().hours(0).minutes(0).seconds(0).milliseconds(0);

			var epochYesterday = moment().subtract(1, 'days').hours(23).minutes(59).seconds(59);

			/*
			*/
			var querrySupervisores = {
				_id:{
					"$ne":req.user.id
				},
				tipo:"Supervisor"
			};
			Contenido.find({seccion:"escritorio"},function(err,contenido){
				if (err) return res.json(error);
			var usuarioQuery = {tipo:{'$nin': ['Administrador', "Supervisor"]}};
			crudUsuario.get(querrySupervisores, function (err, supervisores){
				crudUsuario.getEmpleadoPorSupervisor(req.user.id, usuarioQuery, 
					function(error, usuarios, departamentos){
						var queryInUsers = {
							usuario:{"$in":util.getIdsList(usuarios.concat(supervisores))},
							estado:'Pendiente'
						}; 
						Justificaciones.find(queryInUsers).populate('usuario').exec(function(error, justCount) {
							Solicitudes.find(queryInUsers).populate('usuario').exec(function(error, soliCount) {
								Marca.find({usuario: req.user.id, tipoUsuario: req.session.name, epoch:{"$gte": epochGte.unix()}},{_id:0,tipoMarca:1,epoch:1,dispositivo:1,red:1}).exec(function(error, marcas){
									Justificaciones.find({usuario: req.user.id, estado:'Incompleto', tipoUsuario: req.session.name}).populate('usuario').exec(function(error, justificaciones) {
										Solicitudes.find({estado:'Pendiente'}).populate('usuario').exec(function(error, solicitudes) { 
											Usuario.find({_id:req.user.id},{_id:0,departamentos: 1}).populate('departamentos.departamento').exec(function(error, supervisor){
												CierrePersonal.find({epoch:{"$gte": epochYesterday.unix()}}).exec(function(err, cierres) {
													var cierreUsuarios = [];
													if(cierres && cierres.length>0)
														cierreUsuarios = cierres[0];
												//result.forEach(function(supervisor){
													var sup = {departamentos: [1]};
													var arrayMarcas = util.eventosAjuste(marcas, sup, "escritorioEmpl");

													var array = [];
													for(var y = 0; y < req.user.departamentos.length; y++){
														array.push(req.user.departamentos[y].departamento);
													}
													just = util.eventosAjuste(justificaciones, req.user, "count");
													soli = util.eventosAjuste(solicitudes, req.user, "count");

													/*var horasSemanales;
													(epochGte.day() === 1) ? horasSemanales = 0 : (cierres.length == 0) ? horasSemanales = '' : horasSemanales = cierres[0].horasSemanales;
													*/
													var arrayJust = util.unixTimeToRegularDate(justificaciones);
													if (error) return res.json(error);
													//console.log(cierreUsuarios);

													//Se modifica el tipo tomando el cuenta el tipo con el cual ha iniciado sesion
													req.user.tipo = req.session.name;
												
													//En caso de ser profesor no se pasan las justificaciones
													if(req.user.tipo.length > 1 && req.session.name == config.empleadoProfesor){
														arrayJust = null;
													}
													
													
													crudJustificaciones.conteoJustificacionesTotal(req.user,function (conteoTotal){
														
														if(conteoTotal&& conteoTotal>0){
															conteoJustificacionesTotal=conteoTotal;
															
															return res.render('escritorio', {
																title: 'Escritorio Supervisor | SIGUCA',
																departamentos: supervisor[0].departamentos, 
																justificaciones: arrayJust, 
																solicitudes: soli,
																justCount: justCount.length, 
																soliCount: soliCount.length,
																todos: array,
																usuario: req.user,
																marcas: marcas,
																cierreUsuarios: cierreUsuarios,
																contJust:conteoJustificacionesTotal,
																textos:contenido
																//horasSemanales: horasSemanales
															});
														}else{
															return res.render('escritorio', {
																title: 'Escritorio Supervisor | SIGUCA',
																departamentos: supervisor[0].departamentos, 
																justificaciones: arrayJust, 
																solicitudes: soli,
																justCount: justCount.length, 
																soliCount: soliCount.length,
																todos: array,
																usuario: req.user,
																marcas: marcas,
																cierreUsuarios: cierreUsuarios,
																contJust:0,
																textos:contenido
																//horasSemanales: horasSemanales
															});
														}
													});
												   
													
					                               // });//Supervisor
					                            });//Horas Semanales
					                        });//Departamentos    
					                    });//solicitudes
					                });//Justificaciones
					            });//Marcas
			                });//solicitudes
			            });//Justificaciones
			        });//Justificaciones
				});//Justificaciones
			});
				//
			} else {
				req.logout();
				res.redirect('/');
			}
		},
		escritorioEmpl : function (req, res) {
			if (req.session.name == "Empleado" || req.session.name == config.empleadoProfesor) {
        	//Se toma la hora actual
        	var epochGte = moment();
        	epochGte.hours(0);
        	epochGte.minutes(0);
        	epochGte.seconds(0);

        	var actualEpoch = moment();

	        //Se busca en la base de datos todas las marcas realizadas por el usuario
    		//Se busca en la base de datos las marcas del mismo día
			//console.log(req.user.id);
			Contenido.find({seccion:"escritorioEmpl"},function(err,contenido){
				if (err) return res.json(error);
				Marca.find(
					{usuario: req.user.id, epoch:{"$gte": epochGte.unix()}, tipoUsuario: req.session.name},
					{_id:0,tipoMarca:1,epoch:1,dispositivo:1,red:1}
					).exec(
					function(error, marcas) {
						if (error) return res.json(error);
						Justificaciones.find(
							{usuario: req.user.id, estado:'Incompleto', tipoUsuario: req.session.name}
							).exec(function(err, justificaciones) {
								if (err) return res.json(err);
								var supervisor = {departamentos: [1]};
								var arrayMarcas = util.eventosAjuste(marcas, supervisor, "escritorioEmpl");
								var arrayJust = util.unixTimeToRegularDate(justificaciones, true);
														
								//En caso de ser profesor no se pasan las justificaciones
								if(req.user.tipo.length > 1 && req.session.name == config.empleadoProfesor){
									arrayJust = new Array();
								}
	
								//Se modifica el tipo tomando el cuenta el tipo con el cual ha iniciado sesion
								req.user.tipo = req.session.name;	
	
								return res.render('escritorio', {
									title: 'Escritorio Empleado | SIGUCA',
									usuario: req.user, 
									marcas: arrayMarcas,
									justificaciones : arrayJust,
									textos:contenido
								});
							});
						//
					});
			});
	        
	    	//Buscar las justificaciones que se llamen "Pendiente "
	    } else {
	    	req.logout();
	    	res.redirect('/');
	    }
	},
	escritorioAdmin : function (req, res) {
		req.user.tipo = req.session.name;
		if (req.session.name ==="Administrador") {
			Contenido.find({seccion:"escritorioAdmin"},function(err,contenido){
				if (err) return res.json(error);
				Usuario.find().exec(function(error, usuarios) {
					Horario.find().exec(function(error, horarios) {
						Departamento.find().exec(function(error, departamentos) {
							HorarioFijo.find().exec(function(error,horarioFijo){
								if (error) return res.json(error);
								//Se modifica el tipo tomando el cuenta el tipo con el cual ha iniciado sesion
								req.user.tipo = req.session.name;
								HorarioPersonalizado.find().exec(function(error,personalizado){
									return res.render('escritorio', {
										title: 'Escritorio Administrador | SIGUCA',
										usuario: req.user,
										horarios: horarios,
										departamentos: departamentos,
										usuarios: usuarios,
										tipoEmpleado: config.empleado2,
										empleadoProfesor: config.empleadoProfesor,
										arregloHorarioFijo:horarioFijo,
										horarioPersonalizado:personalizado,
										textos:contenido
									});
								});
							});
						});
					});
					
				});
			});
		} else {
			req.logout();
			res.redirect('/');
		}
	}
};
