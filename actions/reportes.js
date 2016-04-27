
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
	reportes : function (req, res) {
		if (req.session.name == "Supervisor") {
			var epochGte = moment().hours(0).minutes(0).seconds(0);
            var inicioMes = moment().date(1);//primer dia del mes
            var marcaQuery = {};
            //marcaQuery = {epoch:{"$gte": epochGte.unix()}};
            Usuario.find({tipo:{"$nin": ['Administrador']}}).exec(function(error, usuarios) {
            	Marca.find(marcaQuery).populate('usuario').exec(function(error, marcas) {
            		Justificaciones.find({estado:{"$nin": ['Pendiente']}}).populate('usuario').exec(function(error, justificaciones) {
            			Solicitudes.find({tipoSolicitudes:'Extras', estado:{"$nin": ['Pendiente']}}).populate('usuario').exec(function(error, extras) {
            				Solicitudes.find({tipoSolicitudes:'Permisos', estado:{"$nin": ['Pendiente']}}).populate('usuario').exec(function(error, permisos) {
            					Usuario.find({_id:req.user.id},{_id:0,departamentos: 1}).populate('departamentos.departamento').exec(function(error, supervisor){
            						Cierre.find({tipo: 'Personal', epoch: {'$gte' : inicioMes.unix()}}).populate('usuario').exec(function(error, cierres) {
            							var array = [];
            							for(var y = 0; y < req.user.departamentos.length; y++){
            								array.push(req.user.departamentos[y].departamento);
            							}

            							var arrayUsuario = util.eventosAjuste(usuarios, req.user, "reportes");
            							var arrayJust = util.eventosAjuste(justificaciones, req.user, "reportes");
            							var arrayExtras = util.eventosAjuste(extras, req.user, "reportes");
            							var arrayPermisos = util.eventosAjuste(permisos, req.user, "reportes");
            							var arrayMarcas = util.eventosAjuste(marcas, req.user, "reportes");
            							var arrayCierres = util.eventosAjuste(cierres, {departamentos: [1]}, "reportes");

            							if (error) return res.json(error);
            							return res.render('reportes', {
            								title: 'Reportes | SIGUCA',
            								usuario: req.user,
            								justificaciones: arrayJust,
            								extras: arrayExtras,
            								permisos: arrayPermisos,
            								usuarios: arrayUsuario,
            								departamentos: supervisor[0].departamentos,
            								todos: array, 
            								marcas: arrayMarcas,
            								empleado: 'Todos los usuarios',
            								horasSemanales: cierres,
            								resumen: []
                                        });//res.render

                                    });//HorasSemanales
                                });//Supervisor
                            });//Permisos
                        });//Extras
                    });//Marcas
                });//Justificaciones
            });//Usuarios
            //
        } else {
        	req.logout();
        	res.redirect('/');
        }
    }
};
