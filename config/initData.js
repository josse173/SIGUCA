'use strict';

var mongoose = require('mongoose'),
    Usuario = mongoose.model('Usuario'),
    Articulo51 	= require('../models/Articulo51'),
    Horario = require('../models/Horario'),
    Configuracion = mongoose.model('Configuracion'),
    Contenido = mongoose.model('Contenido');

Usuario.findOne({ 'tipo' :  'Administrador' }, function (err, user) {
    if (!user) {


        /* Se crea el horario del usuario tipo administrador por defecto */
        var horario = new Horario({
                nombre: 'horarioAdminDefault',
                horaEntrada: '0:00',
                horaSalida: '0:00',
                rangoJornada: '0:00',
                tiempoReceso: '0:00',
                tiempoAlmuerzo: '0:00',
                tipo: 'Fijo'
            });
        //Crea horario
        horario.save(function (err, horario) {
            if (err) console.log(err);
        });

        /* Se crea el usuario por defecto tipo administrador */
        var newUser = new Usuario({
            username: 'admin',
            tipo: 'Administrador',
            estado: "Activo",
            nombre: 'administrador',
            apellido1: 'GreenCore',
            apellido2: 'Solutions',
            email: 'soporte@greencore.co.cr',
            cedula: 0,
            codTarjeta: 0,
            departamentos: {
                nombre: 'adminDefault'
            },
            horario: horario,
        });
        newUser.password = Usuario.generateHash('admin');

        //Crea Usuario
        newUser.save(function (err, user) {
            if (err) console.log(err);
            console.log("Se ha creado el usuario administrador por defecto admin:admin");
        });


    }
});//Busca Usuario

Configuracion.findOne({ nombreUnico :  'cantidadAlertas' }, function (err, configuracion) {
    if (!configuracion) {
        var configuracionCantidadAlertas = new Configuracion({
            nombreUnico: 'cantidadAlertas',
            nombre: 'Cantidad Alertas por día',
            valor: 2
        });

        configuracionCantidadAlertas.save(function (err, respuesta) {
            if (err) console.log(err);
        });
    }
});

Configuracion.findOne({ nombreUnico :  'tiempoRespuesta' }, function (err, configuracion) {
    if (!configuracion) {
        var configuracionMinutosRespuesta = new Configuracion({
            nombreUnico: 'tiempoRespuesta',
            nombre: 'Tiempo Respuesta en minutos',
            valor: 1
        });

        configuracionMinutosRespuesta.save(function (err, respuesta) {
            if (err) console.log(err);
        });
    }
});

Contenido.findOne({ seccion: 'escritorioEmpl', llave: 'Modal hora extraordinaria etiqueta cliente'}, function (err, contenido) {
    if (contenido) {
        contenido.titulo = 'Ubicación:';

        Contenido.findByIdAndUpdate(contenido._id, contenido, function(err, alerta){
            if (err) console.log(err);
        });
    }
});

Contenido.findOne({ seccion: 'Eventos', llave: 'Tabla Solicitudes de horas extraordinarias etiqueta cliente'}, function (err, contenido) {
    if (contenido) {
        contenido.titulo = 'Ubicación:';

        Contenido.findByIdAndUpdate(contenido._id, contenido, function(err, alerta){
            if (err) console.log(err);
        });
    }
});

Contenido.findOne({ seccion: 'Eventos', llave: 'Titulo Solicitudes de horas extraordinarias'}, function (err, contenido) {
    if (contenido) {
        contenido.titulo = 'Horas extra solicitadas:';

        Contenido.findByIdAndUpdate(contenido._id, contenido, function(err, alerta){
            if (err) console.log(err);
        });
    }
});

Contenido.findOne({ seccion: 'Reportes', llave: 'Solicitud de horas extraordinarias etiqueta cliente'}, function (err, contenido) {
    if (contenido) {
        contenido.titulo = 'Ubicación:';

        Contenido.findByIdAndUpdate(contenido._id, contenido, function(err, alerta){
            if (err) console.log(err);
        });
    }
});

Contenido.findOne({ seccion: 'Reportes', llave: 'Titulo solicitudes horas extraordinarias'}, function (err, contenido) {
    if (contenido) {
        contenido.titulo = 'Reporte horas extra';

        Contenido.findByIdAndUpdate(contenido._id, contenido, function(err, alerta){
            if (err) console.log(err);
        });
    }
});







