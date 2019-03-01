const moment = require('moment');
var Marca = require('../models/Marca');
const User = require('../models/Usuario');
var CierrePersonal = require('../models/CierrePersonal');
var util = require('../util/util');
var CronJob = require('cron').CronJob;
var crud = require('../routes/crud');
var crudHorario = require('../routes/crudHorario');
var crudSolicitud = require('../routes/crudSolicitud');
const Justificaciones = require('../models/Justificaciones');
var crudJustificaciones = require('../routes/crudJustificaciones');
var crudUsuario = require('../routes/crudUsuario');
var Feriado = require('../models/Feriado');

const WORKING_DAYS = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
const USER_TYPES = {ADMIN: 'Administrador', TEACHER: 'Profesor'};
const MAXIMUM_INTERVAL_WORKING = 12;
const SCHEDULER_TYPE = {FIXED: 'horarioFijo', RANGE: 'horarios', EMPLOYEE_SCHEDULE: 'horariosEmpleado'};
const AUTOMATIC_CLOSURE = 'Cierre Automático  de Sistema';
const DAY_NOT_WORKED = "Día no laborado.";
const END_MARK_MISSING = "Olvidó Marcar Salida.";
const START_MARK = "Entrada";
const //cronTime = '* * * * *';
      cronTime = '00 50 23 * * 0-7';
    //cronTime = '50 5,11,17,23 * * *';
module.exports = {
    cierreAutomatico: new CronJob(cronTime, function () {
            DBOperations.findHolidays().then(holidays => {
                if (holidays.length > 0) {
                    console.log("No se generan cierres ni justificaciones, dia feriado");
                } else {
                    console.log("------ Realizando cierre en la fecha '" +  new Date() + "' ------");
                    CronJobOperations.executeAutomaticClosure();
                }
            }).catch(error => console.log(error));
            //Realizar actualización de vacaciones
            //crudUsuario.updateVacaciones();
        },
        null,
        false,
        "America/Costa_Rica"
    ),

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
    return DBOperations.findMarks(_idUser, userType).then(marks => {
        const workedHours = ScheduleOperations.getWorkedHoursByMarks(marks);
        const closingHours = ScheduleOperations.calculateClosureHours(workedHours);
        return ScheduleOperations.addPersonalClosure(_idUser, userType, closingHours)
            .then(result => result)
            .catch(error => error);
    }).catch(error => {
        return error;
    });
};

const CronJobOperations = {
    executeAutomaticClosure() {
        DBOperations.findUsers().then(users => {
            users.forEach(user => {
                //since in some scenarios we can, maybe not possible all the time but could, we dont need to check for worked hours but
                // the filter is by day, so that means if we have 2 marks (start marks) at same day then with the worked hours we could omit one of them
                const day = WORKING_DAYS[moment().day()];
                const userId = user._id;
                user.tipo.filter(type => type !== USER_TYPES.ADMIN).forEach(type =>{
                    let isScheduleAvailable = true;
                    if (user.horarioFijo) isScheduleAvailable = user.horarioFijo[day] === day;
                    if(user.horarioEmpleado) isScheduleAvailable = ScheduleOperations.isValidCustomScheduleDay(user.horarioEmpleado);
                    const schedule = user.horarioEmpleado || user.horarioFijo || user.horario;
                    if (isScheduleAvailable && schedule) {
                        this.automaticClosure(userId, schedule, type).then((result) => {
                            console.log(`Cierre automático procesado correctamente para el usuario: ${result}`)
                        }).catch(error => console.log(error));
                    }
                });
            });
        }).catch(error => console.log("Error retrieving users", JSON.stringify(error)));
    },
    isUserPeriodUnregistered(user, type, closingMarks) {
        return closingMarks.length > 0 ? closingMarks.includes(item => {
            return !user._id.equals(item.usuario) && type !== item.tipoUsuario
        }) : true;
    },
    automaticClosure(_idUser, userSchedule, userType) {
        return new Promise((resolve, reject) => {
            DBOperations.findMarks(_idUser, userType).then(marks => {
                ScheduleOperations.groupMarks(marks).forEach(workedHours => {
                    const startTime = workedHours.startTime !== 0 ? workedHours.startTime.unix() : 0;
                    DBOperations.findWorkedHour(_idUser, startTime).then(result => {
                        if (result) {
                            reject(`La marca de entrada ya ha sido registrada. Usuario: ${_idUser}`);
                        } else {
                            const closingHours = ScheduleOperations.calculateClosureHours(workedHours);

                            let {canCompletePersonalClosing, absentFromWork} = ScheduleOperations.verifyWorkedHours(userSchedule, workedHours, closingHours.asHours());
                            if (absentFromWork) {
                                DBOperations.addPersonalClosure(_idUser, userType, closingHours, true)
                                    .then(() => {
                                        DBOperations.addIncompleteJustification(_idUser, userType, DAY_NOT_WORKED, DAY_NOT_WORKED);
                                        resolve();
                                    }).catch(error => reject(error));
                            } else {
                                if (!canCompletePersonalClosing) {
                                    reject("The current working period does not have a exit mark, but cant be closed because is not in the maximum interval of 12 working hours or the one defined by user schedule");
                                } else {
                                    DBOperations.addPersonalClosure(_idUser, userType, closingHours, true, startTime).then(() => {
                                        DBOperations.addMark(_idUser, userType, startTime);
                                        if (userType !== USER_TYPES.TEACHER) {
                                            DBOperations.addIncompleteJustification(_idUser, userType, END_MARK_MISSING, END_MARK_MISSING)
                                                .then(() => console.log(`Justificación agregada para el usuario ${_idUser}`))
                                                .catch((error) => console.log(error));
                                        }
                                        resolve(_idUser)
                                    }).catch(error => reject(error));
                                }
                            }
                        }
                    });
                });
            }).catch(error => reject(error));
        });
    }
};

const ScheduleType =  {
    isFree(userSchedule){
        return userSchedule.collection.collectionName === SCHEDULER_TYPE.RANGE
    },
    isFixed(userSchedule){
        return userSchedule.collection.collectionName === SCHEDULER_TYPE.FIXED
    },
    isCustom(userSchedule){
        return userSchedule.collection.collectionName === SCHEDULER_TYPE.EMPLOYEE_SCHEDULE
    }
};

const ScheduleOperations = {
    groupMarks(marks){
        const groups = [];
        if(this.moreThanOneStartMark(marks)){
            const startMarks = marks.filter(mark => mark.tipoMarca === START_MARK);
            startMarks.forEach(startMark => {
                const startTime = moment.unix(startMark.epoch);
                const maxRange = moment(startTime).add(MAXIMUM_INTERVAL_WORKING, 'hours');
                const newMarks = [startMark].concat(marks.filter(mark => {
                    if (mark.tipoMarca === AUTOMATIC_CLOSURE && moment.unix(mark.epochMarcaEntrada).diff(startTime) === 0){
                        return mark;
                    } else if(mark.tipoMarca !== START_MARK && moment.unix(mark.epoch).isBetween(startTime, maxRange)){
                        return mark;
                    }
                }));
                groups.push(this.getWorkedHoursByMarks(newMarks));
            });
        }else{
            groups.push(this.getWorkedHoursByMarks(marks));
        }
        return groups;
    },
    moreThanOneStartMark(marks){
      return marks.filter(mark => mark.tipoMarca === START_MARK).length > 1;
    },
    getWorkedHoursByMarks(formattedMarks) {
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
            else if (mark.tipoMarca === AUTOMATIC_CLOSURE) schedule.endTime = unixTime;
            else if (mark.tipoMarca === 'Salida a Receso') schedule.startBreakTime = unixTime;
            else if (mark.tipoMarca === 'Entrada de Receso') schedule.endBreakTime = unixTime;
            else if (mark.tipoMarca === 'Salida al Almuerzo') schedule.startLunchTime = unixTime;
            else if (mark.tipoMarca === 'Entrada de Almuerzo') schedule.endLunchTime = unixTime;
            else if (mark.tipoMarca === "Entrada a extras") schedule.startExtraTime = unixTime;
            else if (mark.tipoMarca === "Salida de extras") schedule.endExtraTime = unixTime
        }
        return schedule;
    },
    calculateClosureHours(workedHours) {
        let totalElapsedTime = moment.duration(0);
        if (workedHours.startTime > 0) {
            const jobEndTime = workedHours.endTime === 0 ? workedHours.automaticEndTime : workedHours.endTime;

            const elapsedTime = this.calculateElapsedTime(jobEndTime, workedHours.startTime);
            const elapsedTimeInBreak = this.calculateElapsedTime(workedHours.endBreakTime, workedHours.startBreakTime);
            const elapsedTimeInLaunch = this.calculateElapsedTime(workedHours.endLunchTime, workedHours.startLunchTime);

            totalElapsedTime = elapsedTime.subtract(elapsedTimeInLaunch).subtract(elapsedTimeInBreak);
        }
        return totalElapsedTime;
    },
    calculateElapsedTime(startTime, endTime){
        return startTime !== 0 && endTime !== 0 ? moment.duration(startTime.diff(endTime)) : moment.duration(0);
    },
    verifyWorkedHours(userSchedule, workedHours, currentWorkDuration) {
        let canCompletePersonalClosing = false, absentFromWork = false;
        if (workedHours.startTime !== 0 && workedHours.endTime === 0) {
            if (ScheduleType.isFree(userSchedule)) {
                canCompletePersonalClosing = currentWorkDuration >= MAXIMUM_INTERVAL_WORKING;
            } else{
                const {start, end} = this.getDefinedWorkHours(userSchedule, workedHours.startTime);
                canCompletePersonalClosing = this.isScheduleOutOfRange(start, end, workedHours.automaticEndTime)
                    && currentWorkDuration >= MAXIMUM_INTERVAL_WORKING;
            }
        }else if(!ScheduleType.isFree(userSchedule) && workedHours.startTime === 0){
            absentFromWork = this.validateUserWithoutStartMark(workedHours.automaticEndTime, userSchedule);
        }
        return {canCompletePersonalClosing, absentFromWork};
    },
    validateUserWithoutStartMark(currentEndTime, userSchedule){
        const {start, end} = this.getDefinedWorkHours(userSchedule, currentEndTime);
        return this.isScheduleOutOfRange(start, end, currentEndTime);
    },
    getDefinedWorkHours(userSchedule, currentEndTime){
        let startTime = 0, endTime = 0;
        if(ScheduleType.isFixed(userSchedule)){
            startTime = userSchedule.horaEntrada;
            endTime = userSchedule.horaSalida;
        }else if(ScheduleType.isCustom(userSchedule)){
            const currentDay = userSchedule[WORKING_DAYS[moment().day()].toLowerCase()];
            startTime = currentDay.entrada.hora;
            endTime = currentDay.salida.hora;
        }
        return {start: this.setTime(currentEndTime, startTime), end: this.setTime(currentEndTime, endTime)};
    },
    isScheduleOutOfRange( startTimeMoment, endTimeMoment, currentEndTime) {
        return currentEndTime.isBefore(startTimeMoment) ? false : !currentEndTime.isBetween(startTimeMoment, endTimeMoment);
    },
    setTime(moment, time) {
        //sanity check
        if(!time.toString().includes(':')) time = `${time}:00`;

        const [hours, minutes] = time.split(':');
        const newMoment = moment.clone();
        newMoment.set({hour: hours, minute: minutes, seconds: 0});
        return newMoment
    },
    getDuration(time)  {
        const [hours, minutes] = time.split(':');
        return moment.duration({hour: hours, minute: minutes})
    },
    getEffectiveTime(startMoment, schedule = {start: 0, end: 0, break: 0, lunch: 0}) {
        const startTimeMoment = this.setTime(startMoment, schedule.start);

        let endTimeMoment = this.setTime(startMoment, schedule.end);
        if (endTimeMoment.isBefore(startTimeMoment)) endTimeMoment.add(1, 'days');

        const lunchTime = this.getDuration(schedule.lunch);
        const breakTime = this.getDuration(schedule.break);

        return this.calculateElapsedTime(endTimeMoment, startTimeMoment).subtract(lunchTime).subtract(breakTime);
    },
    isValidCustomScheduleDay(userSchedule) {
        const currentDay = userSchedule[WORKING_DAYS[moment().day()].toLowerCase()];
        return (currentDay.entrada.hora !== 0) && (currentDay.salida.hora !== 0);
    }
};

const DBOperations = {
    findMarks(_idUser, userType) {
        return new Promise((resolve, reject) => {
            const currentDate = moment().format('L').split("/");
            const year = Number(currentDate[2]), month = currentDate[0] - 1, date = Number(currentDate[1]);

            const epochGte = moment({
                year: year,
                month: month,
                hour: 0,
                minutes: 0,
                seconds: 0
            }).date(date).subtract(1, "days");
            const epochLte = moment({year: year, month: month, hour: 23, minutes: 59, seconds: 59}).date(date);

            Marca.find({
                usuario: _idUser,
                tipoUsuario: userType,
                epoch: {"$gte": epochGte.unix(), "$lte": epochLte.unix(),}
            }).then(marks => resolve(marks)).catch(error => reject(error));
        });
    },
    addMark(_idUser, userType, startMarkUnix){
        return new Promise((resolve, reject) => {
            const mark = DBOperations.createMark(AUTOMATIC_CLOSURE, _idUser, userType, startMarkUnix);
            Marca(mark).save().then(() => resolve()).catch((error) => reject(error));
        });
    },
    createMark(markType, userId, userType, startMarkUnix)  {
        return {
            tipoMarca: markType,
            usuario: userId,
            epoch: moment().unix(),
            epochMarcaEntrada: startMarkUnix,
            tipoUsuario: userType,
            ipOrigen: 'Sistema',
            red: 'Sistema',
            dispositivo: 'Computadora'
        }
    },
    addPersonalClosure(_idUser, userType, closingHours, automaticClosure = false, epochStartMarkUnix= 0)  {
        return new Promise((resolve, reject) => {
            const personaClosingObject = this.createPersonalClosingObject(_idUser, userType, closingHours.hours(), closingHours.minutes(), automaticClosure, epochStartMarkUnix);
            CierrePersonal(personaClosingObject).save()
                .then(result => resolve(result))
                .catch(error => reject(new Error("Error al crear cierre en la fecha '" + new Date() + "' => Mensaje: " + error)));
        });
    },
    createPersonalClosingObject(_idUser, userType, totalElapsedHours, totalElapsedMinutes, automaticClosure, epochStartMarkUnix) {
        return {
            usuario: _idUser,
            tipoUsuario: userType,
            tiempo: {
                horas: automaticClosure ? 0 : totalElapsedHours,
                minutos: automaticClosure ? 0 : totalElapsedMinutes
            },
            epoch: moment().unix(),
            epochMarcaEntrada: epochStartMarkUnix
        }
    },
    findUsers(){
        return new Promise((resolve, reject) => {
            //The closure is created for all users except for the administrator type
            User.find({estado: "Activo"}, {
                _id: 1,
                nombre: 1,
                horarioFijo: 1,
                horario: 1,
                horarioEmpleado: 1,
                tipo: 1
            }).populate("horarioFijo").populate('horario').populate('horarioEmpleado')
                .then(users => resolve(users))
                .catch(error => reject(error));
        });
    },
    findWorkedHours(userId){
        return new Promise((resolve, reject) =>{
            const day = WORKING_DAYS[moment().day()];
            //Dates to find information of the day
            const epochMin = moment().set({hours: 0, minutes: 0, seconds: 0}).subtract(1, "days");
            const epochMax = moment().set({hours: 23, minutes: 59, seconds: 59});
            CierrePersonal.find({
                usuario: userId,
                epoch: {
                    "$gte": epochMin.unix(),
                    "$lte": epochMax.unix()
                }
            }).then(closingMarks => resolve({closingMarks, epochMin, epochMax, day})).catch(error => reject(error))
        });
    },
    findWorkedHour(userId, initialEpoch){
        return new Promise((resolve, reject) =>{
            CierrePersonal.findOne({
                usuario: userId,
                epochMarcaEntrada: initialEpoch
            }).then(workedHour => resolve(workedHour)).catch(error => reject(error))
        });
    },
    findHolidays(){
        return new Promise((resolve, reject) => {
            const date = moment(),
                epochGte = date.hours(0).minutes(0).seconds(0).unix(),
                epochLte = date.hours(23).minutes(59).seconds(59).unix();
            Feriado.find({epoch: {"$gte": epochGte, "$lte": epochLte}}).then(holidays => resolve(holidays)).catch(error => reject(error));
        })
    },
    addIncompleteJustification(_idUser, _userType, reason, information){
        return new Promise((resolve, reject) => {
            const justification = Justificaciones({
                usuario: _idUser,
                fechaCreada: moment().unix(),
                detalle: "",
                motivo: reason,
                estado: 'Incompleta',
                informacion: information,
                comentarioSupervisor: "",
                tipoUsuario: _userType
            });
            justification.save().then(result => resolve(result)).catch(error => reject(error));
        });
    }
};

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
                    DBOperations.addIncompleteJustification(_idUser, tipoUsuario,"Omisión de marca de entrada", "");
                } else if (!marks.salida) {
                    //Solo se genera una notificación de omisión de marca de salida si el usuario incumplió las horas de trabajo
                    DBOperations.addIncompleteJustification(_idUser, tipoUsuario, "Omisión de marca de salida", "");
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
        DBOperations.addIncompleteJustification(_idUser, tipoUsuario, "Jornada laborada menor que la establecida",
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
