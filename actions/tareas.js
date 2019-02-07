const moment = require('moment');
var Marca = require('../models/Marca');
const User = require('../models/Usuario');
var CierrePersonal = require('../models/CierrePersonal');
var util = require('../util/util');
var CronJob = require('cron').CronJob;
var crud = require('../routes/crud');
var crudHorario = require('../routes/crudHorario');
var crudSolicitud = require('../routes/crudSolicitud');
var crudJustificaciones = require('../routes/crudJustificaciones');
var crudUsuario = require('../routes/crudUsuario');
var Feriado = require('../models/Feriado');

const WORKING_DAYS = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
const USER_TYPES = {ADMIN: 'Administrador', TEACHER: 'Profesor'};
const MAXIMUM_INTERVAL_WORKING = 12;
const SCHEDULER_TYPE = {FIXED: 'horarioFijo', RANGE: 'horarios', EMPLOYEE_SCHEDULE: 'horariosEmpleado'};
const START_MARK_MISSING = "Omisión de marca de entrada";

module.exports = {
    cierreAutomatico: new CronJob({
        //cronTime: '* * * * *',
        cronTime: '00 50 23 * * 0-7',
        onTick: function () {
            /**
             * Realizar cierre en la noche
             */

            var date = moment(),
                epochTime = date.unix(),
                epochGte = date.hours(0).minutes(0).seconds(0).unix(),
                epochLte = date.hours(23).minutes(59).seconds(59).unix();

            Feriado.find({epoch: {"$gte": epochGte, "$lte": epochLte}}, function (err, feriado) {
                if (feriado.length > 0) {
                    console.log("No se generan cierres ni justificaciones, dia feriado");
                } else {

                    var hoy = new Date();
                    console.log("------ Realizando cierre en la fecha '" + hoy + "' ------");
                    executeClosingHours();
                }
            });

            /**
             * Realizar actualización de vacaciones
             */
            crudUsuario.updateVacaciones();

        },
        start: false,
        timeZone: "America/Costa_Rica"
    }),

    ejecutarCierrePorUsuarioAlMarcarSalida: function (tipoUsuario, id) {

        var hoy = new Date();

        //Fechas para encontrar información del día
        var epochMin = moment();
        epochMin.hours(0);
        epochMin.minutes(0);
        epochMin.seconds(0);

        var epochMax = moment();
        epochMax.hours(23);
        epochMax.minutes(59);
        epochMax.seconds(59);

        //Se realiza el cierre para todos los usuarios menos el tipo administrador
        User.find({_id: id}, {_id: 1, nombre: 1, horarioEmpleado: 1, tipo: 1}).exec(
            function (err, usuarios) {
                if (!err && usuarios[0].horarioEmpleado) {

                    for (usuario in usuarios) {

                        //console.log(usuarios[usuario]);
                        //Solo se hacen los cierres para quien tenga el horario personalizado hecho
                        if (usuarios[usuario].horarioEmpleado && usuarios[usuario].horarioEmpleado != "") {
                            //console.log(usuarios[usuario].horarioEmpleado);
                            buscarHorario(usuarios[usuario]._id, tipoUsuario, epochMin, epochMax,
                                usuarios[usuario].horarioEmpleado, usuarios[usuario].tipo.length);
                        }
                    }
                } else {
                    User.find({_id: id}, {_id: 1, nombre: 1, horario: 1, tipoUsuario: 1}).exec(
                        function (error, usuario) {
                            if (!err && usuario[0].horario) {
                                var epochTime = moment().unix();
                                cierreHorario(id, usuario[0].horario, epochTime, tipoUsuario);

                            } else {
                                User.find({_id: id}, {_id: 1, nombre: 1, horarioFijo: 1, tipoUsuario: 1}).exec(
                                    function (error, usuario) {
                                        if (!err && usuario[0].horarioFijo) {
                                            var epochTime = moment().unix();
                                            cierreHorario(id, usuario[0].horarioFijo, epochTime, tipoUsuario);
                                        }
                                    });

                            }

                        });

                }
            });
    }

};

////////////////////////////cierreHorario///////////////////////////////////////////////
/**
 *
 * @param _idUser
 * @param userSchedule
 * @param mOut
 * @param userType
 * @returns {Promise<any>} we are returning a promise because we only need to add a justification if we add a personal closing
 */
const cierreHorario = (_idUser, userSchedule, mOut, userType) => {
    return new Promise((resolve, reject) => {
        const currentDate = moment().format('L').split("/");
        const year = Number(currentDate[2]), month = currentDate[0] - 1, date = Number(currentDate[1]);

        const epochGte = moment({year: year, month: month, hour: 0, minutes: 0, seconds: 0}).date(date).subtract(1, "days");;
        const epochLte = moment({year: year, month: month, hour: 23, minutes: 59, seconds: 59}).date(date);

        Marca.find({
            usuario: _idUser,
            tipoUsuario: userType,
            epoch: {"$gte": epochGte.unix(), "$lte": epochLte.unix(),}
        }).then(marks => {
            const workedHours = getWorkedHoursByMarks(marks);
            const closingHours = calculateClosingHours(workedHours);

            let addClosureMark = false;
            if (userSchedule && userSchedule.collection && userSchedule.collection.collectionName === SCHEDULER_TYPE.EMPLOYEE_SCHEDULE)
                addClosureMark = workedHours.startTime === 0;

            let canCompletePersonalClosing = verifyWorkedHours(userSchedule, workedHours, closingHours.asHours());
            if (!canCompletePersonalClosing) {
                reject(new Error("The current working period does not have a exit mark, but cant be closed because is not in the maximum interval of 12 working hours or the one defined by user schedule"));
            } else {
                let personaClosingObject = createPersonalClosingObject(_idUser, userType, closingHours.hours(), closingHours.minutes());
                CierrePersonal(personaClosingObject).save().then(result => {
                    resolve({result: result, addClosureMark: addClosureMark});
                }).catch(error => {
                    reject(new Error("Error al crear cierre en la fecha '" + new Date() + "' => Mensaje: " + error));
                });
            }
        }).catch(error => {
            reject(error);
        });
    });
};

const createPersonalClosingObject = (_idUser, userType, totalElapsedHours, totalElapsedMinutes) => {
    return {
        usuario: _idUser,
        tipoUsuario: userType,
        tiempo: {
            horas: totalElapsedHours,
            minutos: totalElapsedMinutes
        },
        epoch: moment().unix()
    }
};

const getWorkedHoursByMarks = (formattedMarks) => {
    const schedule = {
        startTime: 0,
        endTime: 0,
        startBreakTime: 0,
        endBreakTime: 0,
        startLunchTime: 0,
        endLunchTime: 0,
        startExtraTime: 0,
        endExtraTime: 0,
        automaticEndTime: moment()
    };

    for (const mark of formattedMarks) {
        const unixTime = moment.unix(mark.epoch);
        if (mark.tipoMarca === 'Entrada') schedule.startTime = unixTime;
        else if (mark.tipoMarca === 'Salida') schedule.endTime = unixTime;
        else if (mark.tipoMarca === 'Salida a Receso') schedule.startBreakTime = unixTime;
        else if (mark.tipoMarca === 'Entrada de Receso') schedule.endBreakTime = unixTime;
        else if (mark.tipoMarca === 'Salida al Almuerzo') schedule.startLunchTime = unixTime;
        else if (mark.tipoMarca === 'Entrada de Almuerzo') schedule.endLunchTime = unixTime;
        else if (mark.tipoMarca === "Entrada a extras") schedule.startExtraTime = unixTime;
        else if (mark.tipoMarca === "Salida de extras") schedule.endExtraTime = unixTime
    }
    return schedule;
};

const calculateClosingHours = (workedHours) => {
    let totalElapsedTime = moment.duration(0);
    if (workedHours.startTime > 0) {
        const jobEndTime = workedHours.endTime === 0 ? workedHours.automaticEndTime : workedHours.endTime;

        const elapsedTime = calculateElapsedTime(jobEndTime, workedHours.startTime);
        const elapsedTimeInBreak = calculateElapsedTime(workedHours.endBreakTime, workedHours.startBreakTime);
        const elapsedTimeInLaunch = calculateElapsedTime(workedHours.endLunchTime, workedHours.startLunchTime);

        totalElapsedTime = elapsedTime.subtract(elapsedTimeInLaunch).subtract(elapsedTimeInBreak);
    }
    return totalElapsedTime;
};

const calculateElapsedTime = (startTime, endTime) => {
    return startTime !== 0 && endTime !== 0 ? moment.duration(startTime.diff(endTime)) : moment.duration(0);
};

/**
 *
 * @param userSchedule
 * @param workedHours
 * @param currentWorkDuration
 * @returns {boolean}
 */
const verifyWorkedHours = (userSchedule, workedHours, currentWorkDuration) => {
    let canCompletePersonalClosing = true;
    if (userSchedule && userSchedule.collection && workedHours.startTime !== 0 && workedHours.endTime === 0) {
        if (userSchedule.collection.collectionName === SCHEDULER_TYPE.RANGE) {
            canCompletePersonalClosing = currentWorkDuration >= MAXIMUM_INTERVAL_WORKING;
        } else if (userSchedule.collection.collectionName === SCHEDULER_TYPE.FIXED) {
            canCompletePersonalClosing = verifyFixedSchedule(workedHours, currentWorkDuration, userSchedule);
        } else {
            canCompletePersonalClosing = verifyEmployeeSchedule(workedHours, currentWorkDuration, userSchedule);
        }
    }
    return canCompletePersonalClosing;
};

const verifyFixedSchedule = (workedHours, currentWorkDuration, userSchedule) => {
    const effectiveTime = getEffectiveTime(workedHours.startTime, {
        start: userSchedule.horaEntrada,
        end: userSchedule.horaSalida,
        lunch: userSchedule.tiempoAlmuerzo,
        break: userSchedule.tiempoReceso
    });

    return currentWorkDuration >= effectiveTime.asHours();
};

const verifyEmployeeSchedule = (workedHours, currentWorkDuration, userSchedule) => {
    const day = WORKING_DAYS[moment().day()];
    const currentDay = userSchedule[day.toLowerCase()];

    const effectiveTime = getEffectiveTime(workedHours.startTime, {
        start: `${currentDay.entrada.hora}:${currentDay.entrada.minutos}`,
        end: `${currentDay.salida.hora}:${currentDay.salida.minutos}`,
        lunch: `${userSchedule.tiempoAlmuerzo.hora}:${userSchedule.tiempoAlmuerzo.minutos}`,
        break: `${userSchedule.tiempoReceso.hora}:${userSchedule.tiempoReceso.minutos}`
    });
    return currentWorkDuration >= effectiveTime.asHours();
};

/**
 *
 * @param moment
 * @param time
 * @returns {*}
 */
const setTime = (moment, time) => {
    const [hours, minutes] = time.split(':');
    const newMoment = moment.clone();
    newMoment.set({hour: hours, minute: minutes, seconds: 0});
    return newMoment
};

const getDuration = (time) => {
    const [hours, minutes] = time.split(':');
    return moment.duration({hour: hours, minute: minutes})
};

const getEffectiveTime = (startMoment, schedule = {start: 0, end: 0, break: 0, lunch: 0}) => {
    const startTimeMoment = setTime(startMoment, schedule.start);

    let endTimeMoment = setTime(startMoment, schedule.end);
    if (endTimeMoment.isBefore(startTimeMoment)) endTimeMoment.add(1, 'days');

    const lunchTime = getDuration(schedule.lunch);
    const breakTime = getDuration(schedule.break);

    return calculateElapsedTime(endTimeMoment, startTimeMoment).subtract(lunchTime).subtract(breakTime);
};

/////////////////////////////////////////////////////

//////////////////executeClosingHours///////////////////

const executeClosingHours = () => {
    const day = WORKING_DAYS[moment().day()];
    //Dates to find information of the day
    const epochMin = moment().set({hours: 0, minutes: 0, seconds: 0})/*.subtract(1, "days")*/;
    const epochMax = moment().set({hours: 23, minutes: 59, seconds: 59});

    //The closure is created for all users except for the administrator type
    User.find({estado: "Activo"}, {
        _id: 1,
        nombre: 1,
        horarioFijo: 1,
        horario: 1,
        horarioEmpleado: 1,
        tipo: 1
    }).populate("horarioFijo").populate('horario').populate('horarioEmpleado').then(users => {
        CierrePersonal.find({
            epoch: {
                "$gte": epochMin.unix(),
                "$lte": epochMax.unix()
            }
        }).then(closingMarks => {
            closingHoursByUser(users, closingMarks, epochMin, epochMax, day)
        }).catch(error => {
            console.log("Error retrieving personal closing", JSON.stringify(error))
        })
    }).catch(error => {
        console.log("Error retrieving users", JSON.stringify(error))
    });
};

const closingHoursByUser = (users, closingMarks, epochMin, epochMax, day) => {
    for (const user of users) {
        for (type of user.tipo) {
            if (type !== USER_TYPES.ADMIN) {
                if (isUserPeriodUnregistered(user, type, closingMarks)) {
                    let conditional = true;
                    if (user.horarioFijo) conditional = user.horarioFijo[day] === day;
                    else if (user.horario) conditional = (day !== "Domingo" || day !== "Sabado");

                    const schedule = user.horarioEmpleado || user.horarioFijo || user.horario;

                    closePeriod(user._id, type, schedule, {conditional: conditional})
                }
            }
        }
    }
};

/**
 * This method verify is the user has already a closure
 * @param user
 * @param type
 * @param closingMarks
 * @returns {boolean | *}
 */
const isUserPeriodUnregistered = (user, type, closingMarks) => {
    return closingMarks.length > 0 ? closingMarks.includes(item => {
        return !user._id.equals(item.usuario) && type !== item.tipoUsuario
    }) : true;
};

/**
 * This method manage the possibility of closing the day for a user
 * @param userId
 * @param type User type i.e Administrador, Profesor, Empleado..
 * @param schedule
 * @param mark
 * @param conditional Conditional is always a boolean, so if is not require a conditional for a specific case we always execute the code as well
 */
const closePeriod = (userId, type, schedule, {mark = "Olvidó Marcar Salida.", conditional = true}) => {
    global.globalTipoUsuario = type;
    if (conditional) {
        cierreHorario(userId, schedule, "", type).then((result) => {
            if (type !== USER_TYPES.TEACHER) {
                addJustIncompleta(userId, mark, mark);
                //This is only for horarioEmpleado, when the user forgot the opening mark for the day
                if(result.addClosureMark){
                    addJustIncompleta(userId, START_MARK_MISSING, START_MARK_MISSING);
                }
            }
        }).catch(error => {
            console.log(error)
        });
    }
};

//////////////////////////////////////////////////

var once = false;

function crearCierre(epoch, ejecutar) {
    var hoy = new Date();
    var queryCierre = {epoch: epoch};
    var nuevoCierre = new CierrePersonal(queryCierre);
    nuevoCierre.save(function (err, cierre) {
        if (err)
            console.log("Error al crear cierre en la fecha '" + hoy + "' Mensaje: " + error);
        ejecutar(cierre._id);
    });
}


function buscarHorario(_idUser, tipoUsuario, epochMin, epochMax, horarioEmpleado, numTipos) {
    crudHorario.getById(horarioEmpleado,
        function (error, horario) {
            if (!error && horario) {
                buscarInformacionUsuarioCierre(tipoUsuario, _idUser, epochMin, epochMax, horario, numTipos);
            }
        });
}


function buscarInformacionUsuarioCierre(tipoUsuario, _idUser, epochMin, epochMax, horario, numTipos) {
    Marca.find(
        {
            usuario: _idUser,
            tipoUsuario: tipoUsuario,
            epoch: {
                "$gte": epochMin.unix(),
                "$lte": epochMax.unix()
            }
        },
        {_id: 0, tipoMarca: 1, epoch: 1}
    ).then(marksOfDay => {
        const day = WORKING_DAYS[moment().day()];
        const marks = util.clasificarMarcas(marksOfDay);
        const currentDay = horario[day.toLowerCase()];
        //Si entra a las 00:00 no contará ese día, en caso de ser así el horario debería entrar como mínimo a las 00:01
        if ((currentDay.entrada.hora !== 0 || currentDay.entrada.minutos !== 0)
            && (currentDay.salida.hora > currentDay.entrada.hora || (currentDay.salida.hora === currentDay.entrada.hora && currentDay.salida.minutos > currentDay.entrada.minutos))) {
            global.globalTipoUsuario = tipoUsuario;
            registroHorasRegulares(tipoUsuario, _idUser, marks, currentDay, horario);
            if (tipoUsuario !== USER_TYPES.TEACHER || numTipos === 1) {
                if (!marks.entrada) {
                    addJustIncompleta(_idUser, "Omisión de marca de entrada", "");
                } else if (!marks.salida) {
                    //Solo se genera una notificación de omisión de marca de salida si el usuario incumplió las horas de trabajo
                    addJustIncompleta(_idUser, "Omisión de marca de salida", "");
                }
            }
        }
    }).catch(error => {
        console.log(error)
    });
}

function registroHorasRegulares(tipoUsuario, _idUser, marcas, tiempoDia, horario) {
    var tiempo = util.tiempoTotal(marcas);
    var hIn = {
        h: tiempoDia.entrada.hora,
        m: tiempoDia.entrada.minutos,
    };
    var hOut = {
        h: tiempoDia.salida.hora,
        m: tiempoDia.salida.minutos,
    };
    var almuerzoT = {
        h: horario.tiempoAlmuerzo.hora,
        m: horario.tiempoAlmuerzo.minutos,
    };
    var recesoT = {
        h: horario.tiempoReceso.hora,
        m: horario.tiempoReceso.minutos,
    };
    var totalJornada = util.ajustarHoras(hOut, hIn);
    console.log("Calculando jornada de: " + _idUser);
    console.log(totalJornada);
    console.log(almuerzoT);
    totalJornada = util.ajustarHoras(totalJornada, almuerzoT);
    console.log(totalJornada);
    console.log(recesoT);
    totalJornada = util.ajustarHoras(totalJornada, recesoT);
    console.log(totalJornada);
    console.log(tiempo);
    var comparaH = util.compararHoras(totalJornada.h, totalJornada.m, tiempo.h, tiempo.m);
    agregarUsuarioACierre(tipoUsuario, _idUser, {h: tiempo.h, m: tiempo.m});
    //No importa la hora que salió, lo importante es que cumpla la jornada
    if (comparaH == 1) {
        console.log("Jornada laborada menor que la establecida");
        addJustIncompleta(_idUser, "Jornada laborada menor que la establecida",
            "Horas trabajadas: " + util.horaStr(tiempo.h, tiempo.m) +
            " - Horas establecidas: " + util.horaStr(totalJornada.h, totalJornada.m));
    }
}

function agregarUsuarioACierre(tipoUsuario, _idUser, tiempo) {
    var obj = {
        usuario: _idUser,
        tipoUsuario: tipoUsuario,
        tiempo: {
            horas: tiempo.h,
            minutos: tiempo.m
        },
        epoch: moment().unix()
    };
    var cierre = CierrePersonal(obj);
    cierre.save(function (err, cierreActualizado) {
        if (err)
            console.log("Error al crear cierre en la fecha '" + hoy + "' => Mensaje: " + error);
    });
}

function addJustIncompleta(_idUser, motivo, informacion) {
    crudJustificaciones.addJust(
        {
            id: _idUser, detalle: "", informacion: informacion,
            estado: "Incompleto", motivoJust: "otro",
            motivoOtroJust: motivo
        },
        function () {
        }
    );
}