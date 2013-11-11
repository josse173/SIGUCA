$(document).ready(function (){
    var calen =  $('input').glDatePicker({
    specialDates: [
        {
            date: new Date(2013,9,30,8,20,15),
            data: { message: 'Llegada tardía por accidente de tránsito.' }
        },
        {
            date: new Date("November 04, 2013 03:24:00"),
            data: { message: 'Permiso personal.' }
        },
        {
            date: new Date("November 19, 2013 03:24:00"),
            data: { message: 'Vacaciones' }
        },
        {
            date: new Date("November 22, 2013 03:24:00"),
            data: { message: 'Horas Extras Aprobadas' }
        },
        {
            date: new Date("November 28, 2013 03:24:00"),
            data: { message: 'Cita Médica' }
        },        
    ],
    onClick: function(target, cell, date, data) {
        target.val(date.getYear() + ' - ' +
                    date.getMonth() + ' - ' +
                    date.getDate());
        if(data != null) {
             alert('Permisos-Justificaciones\n' + 'Empleado: Gabriel Martínez Barboza (123456789)\n' + 'Detalle: ' + data.message + '\n' + 'Fecha:' + date.toDateString() + ' ' + date.toTimeString() + '\nEstado: Aprobado');
        }        
    }
    });
})
