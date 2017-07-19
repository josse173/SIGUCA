'use strict';

var mongoose = require('mongoose'),
    Usuario = mongoose.model('Usuario');

Usuario.findOne({ 'tipo' :  'Administrador' }, function (err, user) {
    if (!user) {
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
            departamentos: null,
            horario: null,
        });
        newUser.password = Usuario.generateHash('admin');
        newUser.save(function (err, user) {
            if (err) console.log(err);
            console.log("Se ha creado el usuario administrador por defecto admin:admin");
        });//Crea Usuario
    }
});//Busca Usuario