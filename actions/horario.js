
var crudUsuario = require('../routes/crudUsuario');
var crudHorario = require('../routes/crudHorario');
var async = require("async");
module.exports = {
    create: function (req, res) {
        deserializeHorario(req.body, 
            function(err,nuevoHorario){
                if (err)
                    return res.json({error:err});
                crudHorario.create(nuevoHorario, function(error, horario){
                    if (error)
                        return res.json({error:error});
                    crudUsuario.updateUsuario(
                    {
                        id: req.body.usuario,
                        empleado:{
                            horarioEmpleado : horario._id
                        }
                    },
                    function(err, usuario){
                        if (err)
                            return res.json({error:err});
                        return res.json(usuario);
                    });
                });
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
                        //console.log(horario);
                        if (error)
                            return res.json({error:error});
                        return res.json(horario);
                    });
            });
    }
}

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