$(document).ready(function (){
    var calen =  $('input').glDatePicker({
    specialDates: [
        {
            date: new Date(2013,9,8,8,20,15),
            data: { message: 'Llegada tardía por accidente de tránsito.' }
        },
        {
            date: new Date("October 14, 2013 03:24:00"),
            data: { message: 'Permiso personal.' }
        },
        {
            date: new Date("October 18, 2013 03:24:00"),
            data: { message: 'Llegada tardía por accidente de tránsito.' }
        },
    ],
    onClick: function(target, cell, date, data) {
        target.val(date.getYear() + ' - ' +
                    date.getMonth() + ' - ' +
                    date.getDate());
        if(data != null) {
             alert('Justificación de ausencia/tardía\n' + 'Empleado: Gabriel Martínez Barboza (123456789)\n' + 'Detalle: ' + data.message + '\n' + 'Fecha:' + date.toDateString() + ' ' + date.toTimeString());
        }
        window.confirm("¿Acepta la justificación?");
    }
    });
})
