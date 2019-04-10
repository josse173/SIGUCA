const moment = require('moment');
var Marca = require('../models/Marca');
const User = require('../models/Usuario');
var CierrePersonal = require('../models/CierrePersonal');
var util = require('../util/util');
var CronJob = require('cron').CronJob;
var crudHorario = require('../routes/crudHorario');
const Justificaciones = require('../models/Justificaciones');
var Feriado = require('../models/Feriado');
var Solicitudes = require('../models/Solicitudes');

const WORKING_DAYS = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
const USER_TYPES = {ADMIN: 'Administrador', TEACHER: 'Profesor', REPORT_MANAGER: "Administrador de Reportes", SUPERVISOR: "Supervisor"};
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

        //Se realiza el cierre para todos los usuarios menos el tipo administrador-supervisor-Administrador de reportes
        User.find({_id: id}, {_id: 1, nombre: 1, horarioEmpleado: 1, tipo: 1}).exec(
            function (err, usuarios) {
                if (!err && usuarios[0].horarioEmpleado) {

                    for (usuario in usuarios) {

                        //Solo se hacen los cierres para quien tenga el horario personalizado hecho
                        if (usuarios[usuario].horarioEmpleado && usuarios[usuario].horarioEmpleado != "") {

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
        const closingHours = ScheduleOperations.calculateWorkedHours(workedHours);
        return DBOperations.addPersonalClosure(_idUser, userType, closingHours, false, workedHours.startTime.unix())
            .then(result => result)
            .catch(error => error);
    }).catch(error => {
        return error;
    });
};

const CronJobOperations = {
    executeAutomaticClosure() {
        const day = WORKING_DAYS[moment().day()];
        const today = moment();
        DBOperations.findUsers().then(users => {
            users.forEach(user => {

                DBOperations.findActiveRequest(user).then(request =>{

                    if(request && request.length > 0){
                        console.log(`El usuario ${user._id} (${user.username}) se encuentra en un permiso por lo cual no sera tomado en cuenta en este cierre`);
                    } else {
                        user.departamentos.filter(departamento => departamento.tipo !== USER_TYPES.ADMIN && departamento.tipo !== USER_TYPES.REPORT_MANAGER && departamento.tipo !== USER_TYPES.SUPERVISOR).forEach(type =>{
                            const schedule = user.horarioEmpleado || user.horarioFijo || user.horario;
                            if (schedule) {
                                this.checkUserMarks(user, schedule, type.tipo, day, today).catch(error => console.log(error));
                            }else {
                                console.log(`El usuario ${user._id} (${user.username}) no tiene un horario asociado`);
                            }
                        });
                    }
                });

            });
        }).catch(error => console.log("Error retrieving users", JSON.stringify(error)));
    },
    checkUserMarks(user, userSchedule, userType, currentDay, today) {

        const _idUser = user._id;
        return DBOperations.findMarks(_idUser, userType).then(marks => {
            ScheduleOperations.groupMarks(marks, userSchedule, today).forEach(definedWorkHours => {
                const startTime = definedWorkHours.startTime !== 0 ? definedWorkHours.startTime.unix() : 0;
                DBOperations.findWorkedHour(_idUser, startTime).then(result => {
                    if (result) {
                        console.log(`La marca de salida ya ha sido registrada. Usuario: ${user.nombre}`);
                        console.log(`Cambiando estado de marcas a procesadas en cierre`);
                        definedWorkHours.marks.forEach(function (mark) {
                            DBOperations.updateMark(mark);
                        });
                    } else {
                        const closingHours = ScheduleOperations.calculateWorkedHours(definedWorkHours);

                        let {canCompletePersonalClosing, absentFromWork, isAWorkableDay} = ScheduleOperations.verifyWorkedHours(userSchedule, definedWorkHours, closingHours.asHours(), currentDay);
                        if(!isAWorkableDay && marks.length >= 1)
                            console.log(`${currentDay} no es un día laborable para el usuario; ${user.nombre}, pero tiene marcas pendientes de procesar`);
                        if (absentFromWork) {
                            DBOperations.addPersonalClosure(_idUser, userType, closingHours, true)
                                .then(_ => {
                                    DBOperations.addIncompleteJustification(_idUser, userType, DAY_NOT_WORKED, DAY_NOT_WORKED);
                                    console.log(`${currentDay} no laborado por el usuario: ${user.nombre}`)
                                }).catch(error => console.log(error));
                        } else {
                            if (canCompletePersonalClosing) {
                                DBOperations.addPersonalClosure(_idUser, userType, closingHours, true, startTime).then(() => {
                                    DBOperations.addMark(_idUser, userType, definedWorkHours.startTime).then(_ => console.log(`Marca agregada para el usuario ${user.nombre}`)).catch(error => console.log(error));
                                    if (userType !== USER_TYPES.TEACHER) {
                                        DBOperations.addIncompleteJustification(_idUser, userType, END_MARK_MISSING, END_MARK_MISSING, definedWorkHours.startTime).then(_ => console.log(`Justificación agregada para el usuario ${user.nombre}`)).catch((error) => console.log(error));
                                    }
                                    console.log(`Cierre automático procesado correctamente para el usuario: ${user.nombre}.`)
                                }).then(()=>{
                                    console.log(`Cambiando estado de marcas a procesadas en cierre`);
                                    definedWorkHours.marks.forEach(function (mark) {
                                        DBOperations.updateMark(mark);
                                    });
                                }).catch(error => console.log(error));
                            } else {
                                console.log(`No se ha encontrado una marca de salida asociada a la marca de entrada, pero no es posible agregar la marca de salida aún, debido al intervalo maximo de 12 horas. Usuario ${user.username}`);
                            }
                        }
                    }
                }).catch(error => {
                    console.log(error);
                });
            });
        }).catch(error => {
            console.log(error)
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
    groupMarks(marks, userSchedule, today){
        const groups = [];
        if(marks.length > 0){
            const startMarks = marks.filter(mark => mark.tipoMarca === START_MARK);
            if(!ScheduleType.isFree(userSchedule)) {
                //if a mark for today = current day is  not present then add a default onw because of probably absent day
                const containsTodayMark = startMarks.filter(startMark => {
                    const {start} = this.getDefinedWorkHours(userSchedule, today);
                    return moment.unix(startMark.epoch).isSame(moment(), 'day') && (moment.unix(startMark.epoch).isBefore(start) ||
                        moment.unix(startMark.epoch).isBetween(start, this.setTime(start, '23:50')));
                }).length > 0;
                if(!containsTodayMark) groups.push(this.getWorkedHoursByMarks([]));
            }

            startMarks.forEach(startMark => {
                const startTime = moment.unix(startMark.epoch);
                const maxRange = moment(startTime).add(MAXIMUM_INTERVAL_WORKING, 'hours');
                const newMarks = [startMark].concat(marks.filter(mark => {
                    if (mark.tipoMarca === AUTOMATIC_CLOSURE && moment.unix(mark.epochMarcaEntrada).diff(startTime) === 0) return mark;
                    else if(mark.tipoMarca !== START_MARK && mark.tipoMarca !== AUTOMATIC_CLOSURE && moment.unix(mark.epoch).isBetween(startTime, maxRange)) return mark;
                }));
                groups.push(this.getWorkedHoursByMarks(newMarks));
            });
        }else{
            groups.push(this.getWorkedHoursByMarks(marks));
        }
        return groups;
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
            automaticEndTime: moment(),
            marks:[]
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
            else if (mark.tipoMarca === "Salida de extras") schedule.endExtraTime = unixTime;

            schedule.marks.push(mark);
        }
        return schedule;
    },
    calculateWorkedHours(workedHours) {
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
    /**
     *
     * @param userSchedule User's schedule
     * @param definedWorkHours Start and End Time defined in User's Schedule
     * @param currentWorkDuration
     * @param currentDay
     * @returns {{absentFromWork: boolean, isAWorkableDay: (*|boolean), canCompletePersonalClosing: boolean}}
     */
    verifyWorkedHours(userSchedule, definedWorkHours, currentWorkDuration, currentDay) {
        let canCompletePersonalClosing = false, absentFromWork = false, isAWorkableDay = ScheduleOperations.isAWorkableDay(currentDay, userSchedule);
        if (definedWorkHours.startTime !== 0 && definedWorkHours.endTime === 0) {
            if (ScheduleType.isFree(userSchedule)) {
                canCompletePersonalClosing = currentWorkDuration >= MAXIMUM_INTERVAL_WORKING;
            } else{
                const {start, end} = this.getDefinedWorkHours(userSchedule, definedWorkHours.startTime);
                canCompletePersonalClosing = this.isScheduleOutOfRange(start, end, definedWorkHours.automaticEndTime)
                    && currentWorkDuration >= MAXIMUM_INTERVAL_WORKING;
            }
        }else if(!ScheduleType.isFree(userSchedule) && definedWorkHours.startTime === 0 && isAWorkableDay) {
            absentFromWork = this.validateUserWithoutStartMark(definedWorkHours.automaticEndTime, userSchedule);
        }
        return {canCompletePersonalClosing, absentFromWork, isAWorkableDay};
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
    isScheduleOutOfRange(startTimeMoment, endTimeMoment, currentEndTime) {
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
    /**
     * @param day
     * @param userSchedule
     * @returns {boolean}
     */
    isAWorkableDay(day, userSchedule) {
        let isScheduleAvailable = true;
        if (ScheduleType.isFixed(userSchedule))
            isScheduleAvailable = userSchedule[day] === day;
        else if(ScheduleType.isCustom(userSchedule)){
            const currentDay = userSchedule[WORKING_DAYS[moment().day()].toLowerCase()];
            isScheduleAvailable = (currentDay.entrada.hora !== 0) && (currentDay.salida.hora !== 0);
        }
        return isScheduleAvailable;
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
                procesadaEnCierre: false,
                epoch: {"$gte": epochGte.unix(), "$lte": epochLte.unix()}
            }).then(marks => resolve(marks)).catch(error => reject(error));
        });
    },
    addMark(_idUser, userType, startMark){
        return new Promise((resolve, reject) => {
            const mark = DBOperations.createMark(AUTOMATIC_CLOSURE, _idUser, userType, startMark);
            Marca(mark).save().then(() => resolve()).catch((error) => reject(error));
        });
    },
    createMark(markType, userId, userType, startMark)  {
        const currentMoment = moment();
        return {
            tipoMarca: `${markType} (${currentMoment.format('DD-MM-YYYY HH:mm')})`,
            usuario: userId,
            epochCreacion: currentMoment.unix(),
            epoch: startMark.set({hour:currentMoment.hours(),minute:currentMoment.minutes()}).unix(),
            epochMarcaEntrada: startMark.unix(),
            tipoUsuario: userType,
            ipOrigen: 'Sistema',
            red: 'Sistema',
            dispositivo: 'Computadora',
            procesadaEnCierre: true
        }
    },
    addPersonalClosure(_idUser, userType, closingHours, automaticClosure = false, epochStartMarkUnix= 0)  {
        return new Promise((resolve, reject) => {
            const personaClosingObject = this.createPersonalClosingObject(_idUser, userType, closingHours.hours(), closingHours.minutes(), automaticClosure, epochStartMarkUnix);
            CierrePersonal(personaClosingObject).save()
                .then(result => {
                    resolve(result);})
                .catch(error => {
                    reject(new Error("Error al crear cierre en la fecha '" + new Date() + "' => Mensaje: " + error))
                } );
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
            User.find({estado: "Activo"}).populate("horarioFijo").populate('horario').populate('horarioEmpleado')
                .then(users => resolve(users))
                .catch(error => reject(error));
        });
    },
    findActiveRequest(user){
        return new Promise((resolve, reject) => {
            //The closure is created for all users except for the administrator type
            var date = moment();
            date.set({hour:0,minute:0,second:0,millisecond:0});
            var currentDate  = date.unix();
            Solicitudes.find({usuario: user._id, estado: "Aceptada", epochInicio: { "$lte": currentDate}, epochTermino : {"$gte": currentDate },  motivo: {$in: ["Permiso sin goce de salario", "Vacaciones", "Articulo 51", "Salida-Visita (INS)"]}})
                .then(request => resolve(request))
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
            let query = { usuario: userId };
            if(initialEpoch === 0){
                const date = moment();
                let start = date.hours(0).minutes(0).seconds(0).unix(), end = date.hours(23).minutes(59).seconds(59).unix();
                query = {...query, epoch: {"$gte": start, "$lte": end}};
            }else{
                query = {...query, epochMarcaEntrada: initialEpoch}
            }
            CierrePersonal.findOne(query).then(workedHour =>
                resolve(workedHour))
                .catch(error => reject(error))
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
    addIncompleteJustification(_idUser, _userType, reason, information, markDate){
        return new Promise((resolve, reject) => {
            const currentMoment = moment();
            const justification = Justificaciones({
                usuario: _idUser,
                epochCreacion: currentMoment.unix(),
                fechaCreada: markDate ? markDate.set({hour:currentMoment.hours(),minute:currentMoment.minutes()}).unix() : moment().unix(),
                detalle: "",
                motivo: reason,
                estado: 'Incompleto',
                informacion: information,
                comentarioSupervisor: "",
                tipoUsuario: _userType
            });
            justification.save().then(result => resolve(result)).catch(error => reject(error));
        });
    },
    updateMark(mark){
        return new Promise((resolve, reject) => {
            mark.procesadaEnCierre = true;
            mark.save().then(() => resolve()).catch((error) => reject(error));
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

    totalJornada = util.ajustarHoras(totalJornada, almuerzoT);

    totalJornada = util.ajustarHoras(totalJornada, recesoT);

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
