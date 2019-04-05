
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
var Configuracion = require('../models/Configuracion');
var Alerta = require('../models/Alerta');
var PeriodoUsuario = require('../models/PeriodoUsuario');
var HoraExtra = require('../models/HoraExtra');
var PermisoSinSalario = require('../models/PermisoSinSalario');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

module.exports = {
	escritorio : function (req, res) {

		var conteoJustificacionesTotal = 0;
		req.user.tipo = req.session.name;
		if (req.session.name === "Supervisor" || req.session.name === "Administrador de Reportes") {
			var epochGte = moment().hours(0).minutes(0).seconds(0).milliseconds(0);

			var epochYesterday = moment().subtract(1, 'days').hours(23).minutes(59).seconds(59);

			/*
			*/
			var querrySupervisores = {
				_id:{
					"$ne":ObjectId(req.user.id)
				},
				departamentos: {$elemMatch: {departamento: ObjectId(req.user.departamentos[0].departamento), tipo: 'Supervisor'}}
			};

			var arrayDepartamentosUsuarioEsSupervisor = [];

			if(req.user.departamentos && req.user.departamentos.length > 0){
				req.user.departamentos.forEach(function (departamento) {
					if(departamento.tipo === "Supervisor"){
						arrayDepartamentosUsuarioEsSupervisor.push(departamento.departamento)
					}
				})
			}

			Contenido.find({seccion:"escritorio"},function(err,contenido){
			    if (err) return res.json(error);
			    var usuarioQuery = { departamentos : { $elemMatch: { tipo: {$in: ['Empleado', 'Usuario sin acceso web']}, departamento: {$in: arrayDepartamentosUsuarioEsSupervisor}}}};

			    crudUsuario.get(querrySupervisores, function (err, supervisores){

			        crudUsuario.getEmpleadoPorSupervisor(req.user.id, usuarioQuery,function(error, usuarios, departamentos){

						var queryInUsers = {
							usuario: {"$in":util.getIdsList(usuarios.concat(supervisores))},
							estado: 'Pendiente'
						};

						Justificaciones.find(queryInUsers).populate('usuario').exec(function(error, justCount) {
							Solicitudes.find(queryInUsers).populate('usuario').exec(function(error, soliCount) {
								HoraExtra.find(queryInUsers).populate('usuario').exec(function(error, extras) {
									Marca.find({usuario: req.user.id, tipoUsuario: req.session.name, procesadaEnCierre: false},{_id:0,tipoMarca:1,epoch:1,dispositivo:1,red:1}).exec(function(error, marcas){
										Justificaciones.find({usuario: req.user.id, estado:'Incompleto', tipoUsuario: req.session.name}).populate('usuario').exec(function(error, justificaciones) {
											Solicitudes.find({estado:'Pendiente'}).populate('usuario').exec(function(error, solicitudes) {
												Usuario.find({_id:req.user.id},{_id:0,departamentos: 1}).populate('departamentos.departamento').exec(function(error, supervisor){
													PermisoSinSalario.find().sort({numero: 1}).exec(function(error, permisosSinSalario) {
														CierrePersonal.find({epoch:{"$gte": epochYesterday.unix()}}).exec(function(err, cierres) {

															var depIds = [];

															if(req.user.departamentos && req.user.departamentos.length > 0){
																req.user.departamentos.forEach(function (departamento){
																	if(departamento.departamento){
																		depIds.push(departamento.departamento.toString());
																	}
																});
															}

															Departamento.find({_id:{"$in": depIds}}).exec(function(error, departamentosUsuario){
																if (error) return res.json(err);
																PeriodoUsuario.find({usuario: req.user.id}).sort({numeroPeriodo: 1}).exec(function(error, periodos){
																	if (error) return res.json(err);

																	var infoPeriodo = {
																		cargoAlosPeriodos: [],
																		diasDerechoDisfrutar: 0,
																		diasDisfrutados: 0,
																		diasDisponibles: 0
																	};

																	crudUsuario.validarPeriodoUsuario(req.user, periodos);

																	periodos.forEach(function (periodo) {
																		if(!(periodo.diasDisfrutados === periodo.diasAsignados)){
																			infoPeriodo.cargoAlosPeriodos.push(periodo.numeroPeriodo)
																		}
																		infoPeriodo.diasDerechoDisfrutar = infoPeriodo.diasDerechoDisfrutar + periodo.diasAsignados;
																		infoPeriodo.diasDisfrutados = infoPeriodo.diasDisfrutados + periodo.diasDisfrutados;

																	});

																	infoPeriodo.diasDisponibles = infoPeriodo.diasDerechoDisfrutar-infoPeriodo.diasDisfrutados;

																	var cierreUsuarios = [];
																	if(cierres && cierres.length>0)
																		cierreUsuarios = cierres[0];

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


																	//Se modifica el tipo tomando el cuenta el tipo con el cual ha iniciado sesion
																	req.user.tipo = req.session.name;

																	//En caso de ser profesor no se pasan las justificaciones
																	if(req.user.tipo && req.session.name == config.empleadoProfesor){
																		arrayJust = null;
																	}

																	crudJustificaciones.conteoJustificacionesTotal(req.user,function (conteoTotal){

																		if(conteoTotal&& conteoTotal>0){
																			conteoJustificacionesTotal=conteoTotal;

																			return retornaRenderSupervisor(supervisor[0].departamentos, arrayJust, soli, justCount.length, (soliCount.length + extras.length), array, req.user, marcas, cierreUsuarios, conteoJustificacionesTotal, contenido, departamentosUsuario, infoPeriodo, permisosSinSalario);

																		}else{
																			return retornaRenderSupervisor(supervisor[0].departamentos, arrayJust, soli, justCount.length, (soliCount.length + extras.length), array, req.user, marcas, cierreUsuarios, 0, contenido, departamentosUsuario, infoPeriodo, permisosSinSalario);
																		}
																	});
																});
															});
														});//Horas Semanales
													});
												});//Departamentos
											});//solicitudes
										});//Justificaciones
									});//Marcas
								});
							});//solicitudes
			            });//Justificaciones
			        });//Justificaciones
				});//Justificaciones
			});
        } else {
            req.logout();
            res.redirect('/');
        }

        function retornaRenderSupervisor(departamentos, justificaciones, solicitudes, justCount, soliCount, todos, usuario, marcas, cierreUsuarios, contJust, textos, departamentosUsuario, infoPeriodos, permisosSinSalario) {
            return res.render('escritorio', {
                title: 'Escritorio Supervisor | SIGUCA',
                departamentos: departamentos,
                justificaciones: justificaciones,
                solicitudes: solicitudes,
                justCount: justCount,
                soliCount: soliCount,
                todos: todos,
                usuario: usuario,
                marcas: marcas,
                cierreUsuarios: cierreUsuarios,
                contJust: contJust,
                textos: textos,
                departamentosUsuario: departamentosUsuario,
                infoPeriodos: infoPeriodos,
				permisosSinSalario: permisosSinSalario
            });

        }
    },
	escritorioEmpl : function (req, res) {
		if (req.session.name == "Empleado" || req.session.name == config.empleadoProfesor) {
		//Se toma la hora actual
		var epochGte = moment();
		epochGte.hours(0);
		epochGte.minutes(0);
		epochGte.seconds(0);

		//Se busca en la base de datos todas las marcas realizadas por el usuario
		//Se busca en la base de datos las marcas del mismo día

		Contenido.find({seccion:"escritorioEmpl"},function(error,contenido){
			if (error) return res.json(error);
			PermisoSinSalario.find().sort({numero: 1}).exec(function(error, permisosSinSalario) {
				if (error) return res.json(error);
				Marca.find({usuario: req.user.id, procesadaEnCierre: false, tipoUsuario: req.session.name}, {_id:0, tipoMarca:1, epoch:1, dispositivo:1, red:1}).exec( function(error, marcas) {
					if (error) return res.json(error);
					Justificaciones.find({usuario: req.user.id, estado:'Incompleto', tipoUsuario: req.session.name}).exec(function(error, justificaciones) {
						if (error) return res.json(error);

						var depIds = [];

						if(req.user.departamentos && req.user.departamentos.length > 0){
							req.user.departamentos.forEach(function (departamento){
								if(departamento.departamento){
									depIds.push(departamento.departamento.toString());
								}
							});
						}

						Departamento.find({_id:{"$in": depIds}}).exec(function(error, departamentosUsuario){
							if (error) return res.json(err);
							PeriodoUsuario.find({usuario: req.user.id}).sort({numeroPeriodo: 1}).populate('usuario').populate('periodo').exec(function(error, periodos){
								if (error) return res.json(err);

								var infoPeriodo = {
									cargoAlosPeriodos: [],
									diasDerechoDisfrutar: 0,
									diasDisfrutados: 0,
									diasDisponibles: 0
								};

								periodos.forEach(function (periodo) {
									if(!(periodo.diasDisfrutados === periodo.diasAsignados)){
										infoPeriodo.cargoAlosPeriodos.push(periodo.numeroPeriodo)
									}
									infoPeriodo.diasDerechoDisfrutar = infoPeriodo.diasDerechoDisfrutar + periodo.diasAsignados;
									infoPeriodo.diasDisfrutados = infoPeriodo.diasDisfrutados + periodo.diasDisfrutados;

								});

								crudUsuario.validarPeriodoUsuario(req.user, periodos);

								 infoPeriodo.diasDisponibles = infoPeriodo.diasDerechoDisfrutar-infoPeriodo.diasDisfrutados;

								var supervisor = {departamentos: [1]};
								var arrayMarcas = util.eventosAjuste(marcas, supervisor, "escritorioEmpl");
								var arrayJust = util.unixTimeToRegularDate(justificaciones, true);

								//En caso de ser profesor no se pasan las justificaciones
								if(req.user.departamentos.length > 1 && req.session.name == config.empleadoProfesor){
									arrayJust = new Array();
								}

								//Se modifica el tipo tomando el cuenta el tipo con el cual ha iniciado sesion
								req.user.tipo = req.session.name;

								if(req.user.teleTrabajo && req.user.teleTrabajo === 'on'){
									Configuracion.findOne({nombreUnico:"cantidadAlertas"}, function(err,cantidadAlertas){
										if (err) return res.json(err);
										Configuracion.findOne({nombreUnico:"tiempoRespuesta"}, function(err,tiempoRespuesta){
											if (err) return res.json(err);

											var fechaActual = new Date();

											Alerta.find({ $expr: { $and: [ { $eq: [ { $year: "$fechaAlerta" }, fechaActual.getFullYear()] }, {$eq: [{ $month: "$fechaAlerta" }, fechaActual.getMonth()+1]}, {$eq: [{ $dayOfMonth: "$fechaAlerta" }, fechaActual.getDate()] }]} }, function(err, alertas){
												if (err) return res.json(err);

												var listaAlertas = [];
												var crearAlertas = true;

												alertas.forEach(function(alerta) {

													if(alerta.usuario.toString() === req.user.id.toString()){
														crearAlertas = false;
														listaAlertas.push(alerta);
													}
												});

												if (crearAlertas) {

													var horaEntrada = '';
													var horaSalida = '';
													var minutosEntrada = '';
													var minutosSalida = '';

													if(req.user.horarioFijo){
														HorarioFijo.findOne({_id: req.user.horarioFijo}, function(err, horarioFijo){
															if (err) return res.json(err);

															horaEntrada = horarioFijo.horaEntrada.split(":")[0];
															horaSalida = horarioFijo.horaSalida.split(":")[0];
															minutosEntrada = horarioFijo.horaEntrada.split(":")[1];
															minutosSalida = horarioFijo.horaSalida.split(":")[1] === '00' ? '59' : horarioFijo.horaSalida.split(":")[1];

															let i;
															for (i = 0; i < cantidadAlertas.valor; i++) {
																listaAlertas.push(crearAlerta(horaEntrada, horaSalida, minutosEntrada, minutosSalida));
															}

															return retornarRenderEmpleado(req.user, arrayMarcas, arrayJust, contenido, JSON.stringify(listaAlertas), tiempoRespuesta.valor, departamentosUsuario, infoPeriodo, periodos, permisosSinSalario);

														});
													} else if(req.user.horario){
														Horario.findOne({_id: req.user.horario}, function(err, horario){
															if (err) return res.json(err);
															horaEntrada = fechaActual.getHours().toString();
															horaSalida = (fechaActual.getHours() + Number(horario.rangoJornada.split(":")[0])).toString();
															minutosEntrada = fechaActual.getMinutes().toString();
															minutosSalida = '59';

															let i;
															for (i = 0; i < cantidadAlertas.valor; i++) {
																listaAlertas.push(crearAlerta(horaEntrada, horaSalida, minutosEntrada, minutosSalida));
															}

															return retornarRenderEmpleado(req.user, arrayMarcas, arrayJust, contenido, JSON.stringify(listaAlertas), tiempoRespuesta.valor, departamentosUsuario, infoPeriodo, periodos, permisosSinSalario);

														});
													} else if(req.user.horarioEmpleado){
														HorarioPersonalizado.findOne({_id: req.user.horarioEmpleado}, function(err, horarioPersonalizado){
															if (err) return res.json(err);

															switch (fechaActual.getDay()) {
																case 0:
																	horaEntrada = horarioPersonalizado.domingo.entrada.hora.toString();
																	horaSalida = horarioPersonalizado.domingo.salida.hora.toString();
																	minutosEntrada = horarioPersonalizado.domingo.entrada.minutos.toString();
																	minutosSalida = horarioPersonalizado.domingo.salida.minutos.toString() === '0' ? '59' : horarioPersonalizado.domingo.salida.minutos.toString();
																	break;
																case 1:
																	horaEntrada = horarioPersonalizado.lunes.entrada.hora.toString();
																	horaSalida = horarioPersonalizado.lunes.salida.hora.toString();
																	minutosEntrada = horarioPersonalizado.lunes.entrada.minutos.toString();
																	minutosSalida = horarioPersonalizado.lunes.salida.minutos.toString() === '0' ? '59' : horarioPersonalizado.lunes.salida.minutos.toString();
																	break;
																case 2:
																	horaEntrada = horarioPersonalizado.martes.entrada.hora.toString();
																	horaSalida = horarioPersonalizado.martes.salida.hora.toString();
																	minutosEntrada = horarioPersonalizado.martes.entrada.minutos.toString();
																	minutosSalida = horarioPersonalizado.martes.salida.minutos.toString() === '0' ? '59' : horarioPersonalizado.martes.salida.minutos.toString();
																	break;
																case 3:
																	horaEntrada = horarioPersonalizado.miercoles.entrada.hora.toString();
																	horaSalida = horarioPersonalizado.miercoles.salida.hora.toString();
																	minutosEntrada = horarioPersonalizado.miercoles.entrada.minutos.toString();
																	minutosSalida = horarioPersonalizado.miercoles.salida.minutos.toString() === '0' ? '59' : horarioPersonalizado.miercoles.salida.minutos.toString();
																	break;
																case 4:
																	horaEntrada = horarioPersonalizado.jueves.entrada.hora.toString();
																	horaSalida = horarioPersonalizado.jueves.salida.hora.toString();
																	minutosEntrada = horarioPersonalizado.jueves.entrada.minutos.toString();
																	minutosSalida = horarioPersonalizado.jueves.salida.minutos.toString() === '0' ? '59' : horarioPersonalizado.jueves.salida.minutos.toString();
																	break;
																case 5:
																	horaEntrada = horarioPersonalizado.viernes.entrada.hora.toString();
																	horaSalida = horarioPersonalizado.viernes.salida.hora.toString();
																	minutosEntrada = horarioPersonalizado.viernes.entrada.minutos.toString();
																	minutosSalida = horarioPersonalizado.viernes.salida.minutos.toString() === '0' ? '59' : horarioPersonalizado.viernes.salida.minutos.toString();
																	break;
																case  6:
																	horaEntrada = horarioPersonalizado.sabado.entrada.hora.toString();
																	horaSalida = horarioPersonalizado.sabado.salida.hora.toString();
																	minutosEntrada = horarioPersonalizado.sabado.entrada.minutos.toString();
																	minutosSalida = horarioPersonalizado.sabado.salida.minutos.toString() === '0' ? '59' : horarioPersonalizado.sabado.salida.minutos.toString();
															}

															let i;
															for (i = 0; i < cantidadAlertas.valor; i++) {
																listaAlertas.push(crearAlerta(horaEntrada, horaSalida, minutosEntrada, minutosSalida));
															}

															return retornarRenderEmpleado(req.user, arrayMarcas, arrayJust, contenido, JSON.stringify(listaAlertas), tiempoRespuesta.valor, departamentosUsuario, infoPeriodo, periodos, permisosSinSalario);
														});
													}

												} else {
													return retornarRenderEmpleado(req.user, arrayMarcas, arrayJust, contenido, JSON.stringify(listaAlertas), tiempoRespuesta.valor, departamentosUsuario, infoPeriodo, periodos, permisosSinSalario);
												}
											});
										});
									});

								} else {
									return retornarRenderEmpleado(req.user, arrayMarcas, arrayJust, contenido, JSON.stringify([]), 0, departamentosUsuario, infoPeriodo, periodos, permisosSinSalario);
								}
							});
						});
					});
				});
			});
		});

		//Buscar las justificaciones que se llamen "Pendiente "
	} else {
		req.logout();
		res.redirect('/');
	}

    function crearAlerta(horaEntrada, horaSalida, minutosEntrada, minutosSalida) {
		var fechaActual = moment();
		var fechaAlerta = fechaAleatoria(Number(fechaActual.get('hour')), Number(horaSalida), Number(fechaActual.get('minute')), Number(minutosSalida));

        var nuevaAlerta = new Alerta({
            usuario: req.user.id,
			fechaCreacion: moment().unix(),
			fechaAlerta: fechaAlerta,
			fechaAlertaUnix: moment(fechaAlerta).unix(),
            mostrada: false,
        });

        nuevaAlerta.save(function (err, respuesta) {
            if (err) console.log(err);
        });

        return nuevaAlerta;
    }

    function retornarRenderEmpleado(usuario, marcas, justificaciones, textos, alertas, tiempoRespuesta, departamentos, infoPeriodos, periodos, permisosSinSalario){

        return res.render('escritorio', {
            title: 'Escritorio Empleado | SIGUCA',
            usuario: usuario,
            marcas: marcas,
            justificaciones: justificaciones,
            textos: textos,
            alertas: alertas,
            tiempoRespuesta: tiempoRespuesta,
			departamentosUsuario: departamentos,
			infoPeriodos: infoPeriodos,
			periodos: periodos,
			permisosSinSalario: permisosSinSalario
        });

    }

    function fechaAleatoria(horaInicial, horaFinal, minutosInicial, minutosfinal) {

		horaFinal = horaFinal -1;

        var fecha = new Date();
        var horaAleatoria = Math.floor(Math.random()*(horaFinal-horaInicial+1)+horaInicial) ;
		var minutosAleatorio = Math.floor(Math.random() * minutosfinal) + minutosInicial;


		fecha.setHours(horaAleatoria);
        fecha.setMinutes(minutosAleatorio);

        return fecha;
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
