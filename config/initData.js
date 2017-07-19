'use strict';

var mongoose = require('mongoose'),
    Usuario = mongoose.model('Usuario'),
    Horario = require('../models/Horario');

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