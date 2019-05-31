
var crudUsuario = require('../routes/crudUsuario');
var crudHorario = require('../routes/crudHorario');
var Usuario = require('../models/Usuario.js');
var async = require("async");
module.exports = {


    create: function (req, res) {

        deserializeHorario(req.body,
            function(err,nuevoHorario){
                if (err)
                      res.redirect('/escritorioAdmin');
                else{
                    nuevoHorario.nombreHorarioPersonalizado=req.body.nombreHorarioPersonalizado;
                    crudHorario.create(nuevoHorario, function(error, horario){
                        if (error){
                            res.redirect('/escritorioAdmin');
                        }else{
                            Usuario.update({_id:req.body.usuario},{ $unset: {horario: ""}},function(error,correcto){
                            });
                             Usuario.update({_id:req.body.usuario},{ $unset: {horarioFijo: ""}},function(error,correcto){
                            });
                            res.redirect('/escritorioAdmin');
                        }

                    });


                }

            });
    },
    //
    updateByUser : function (req, res) {
        deserializeHorario(req.body,
            function(err,nuevoHorario){
                if (err)
                    return res.json({error:err});
                crudHorario.updateByUser(req.body.usuario,
                    nuevoHorario, function(error, horario){

                        if (error)
                            return res.json({error:error});
                        Usuario.update({_id:req.body.usuario},{ $unset: {horario: ""}},function(error,correcto){
                            if(error){

                            }else{

                            }
                        });

                        return res.json(horario);
                    });
            });
    }
}

function deserializeHorario(serialHorario, cb){

    var horario = {};

    horario.lunes = {
        entrada: obtenerHoraMinutos(serialHorario.lunesHoraEntrada),
        salida: obtenerHoraMinutos(serialHorario.lunesHoraSalida)
    };

    horario.martes = {
        entrada: obtenerHoraMinutos(serialHorario.martesHoraEntrada),
        salida: obtenerHoraMinutos(serialHorario.martesHoraSalida)
    };

    horario.miercoles = {
        entrada: obtenerHoraMinutos(serialHorario.miercolesHoraEntrada),
        salida: obtenerHoraMinutos(serialHorario.miercolesHoraSalida)
    };

    horario.jueves = {
        entrada: obtenerHoraMinutos(serialHorario.juevesHoraEntrada),
        salida: obtenerHoraMinutos(serialHorario.juevesHoraSalida)
    };

    horario.viernes = {
        entrada: obtenerHoraMinutos(serialHorario.viernesHoraEntrada),
        salida: obtenerHoraMinutos(serialHorario.viernesHoraSalida)
    };

    horario.sabado = {
        entrada: obtenerHoraMinutos(serialHorario.sabadoHoraEntrada),
        salida: obtenerHoraMinutos(serialHorario.sabadoHoraSalida)
    };

    horario.domingo = {
        entrada: obtenerHoraMinutos(serialHorario.domingoHoraEntrada),
        salida: obtenerHoraMinutos(serialHorario.domingoHoraSalida)
    };

    horario.tiempoReceso = obtenerHoraMinutos(serialHorario.tiempoReceso[0]);
    horario.tiempoAlmuerzo = obtenerHoraMinutos(serialHorario.tiempoAlmuerzo[0]);

    cb(null, horario);

    function obtenerHoraMinutos(tiempo){
        return {
            hora: parseInt(tiempo.split(":")[0]),
            minutos: parseInt(tiempo.split(":")[1])
        }
    }
}

/*
function deserializeHorario(serialHorario, cb){
    function tiempo(obj, name){
        return {
            hora: parseInt(obj[name].split(":")[0]),
            minutos: parseInt(obj[name].split(":")[1])
        }
    }
    async.reduce(
        ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"],
        {
            tiempoReceso: tiempo(serialHorario, "tiempoReceso"),
            tiempoAlmuerzo: tiempo(serialHorario, "tiempoAlmuerzo")
        },
        function(nuevoHorario, dia, callback){
            nuevoHorario[dia] = {
                entrada: tiempo(serialHorario, dia+"HoraEntrada"),
                salida: tiempo(serialHorario, dia+"HoraSalida")
            }
            callback(null, nuevoHorario);
        }, cb);
}
*/
