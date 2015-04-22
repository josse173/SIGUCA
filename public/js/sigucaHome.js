
    //Declaramos el objeto socket que se conectará en este caso a localhost
    var socket = io.connect('http://localhost:3000');


    //Si estamos conectados, muestra el log y cambia el mensaje
    socket.on('connected', function () {
        selectValue();
    });

    function selectValue(){
        var value = $('#selectFiltro').val();
        //alert(value);
        socket.emit('listar', value);
    }

    $('#selectFiltro').change(function(){
        $('#cal').empty();
        selectValue();
    });


    //Se recibe result de la consulta
    socket.on('listaCierre', function(cierre){
        var stats = {};
        for (var d in cierre)
            stats[cierre[d].epoch] = cierre[d].estado;
        calendario(stats, [2, 5, 10, 15, 20]);
    });

    socket.on('listaCierreEmpleado', function(result){
        var stats = {};
        if(result.tipo == "general")
            for (var d in result.cierre)
                stats[result.cierre[d].epoch] = result.cierre[d].estado;
        else{
            if(result.tipo == "justificaciones")
                for (var d in result.cierre)
                    stats[result.cierre[d].epoch] = result.cierre[d].justificaciones;
            else{
                if(result.tipo == "solicitudes")
                    for (var d in result.cierre)
                        stats[result.cierre[d].epoch] = result.cierre[d].solicitudes;
                else
                    for (var d in result.cierre)
                        stats[result.cierre[d].epoch] = result.cierre[d].marcas;
            }
        }
        calendario(stats, [2, 5, 10]);
    });

    $('#selectMotivo').change(function (){
        if($('#selectMotivo').val() == 'otro') $("#motivoOtro").removeAttr('disabled');
        else $("#motivoOtro").attr('disabled','disabled');
    });

    $('#selectMotivo1').change(function (){
        if($('#selectMotivo1').val() == 'otro') $("#motivoOtro1").removeAttr('disabled');
        else $("#motivoOtro1").attr('disabled','disabled');
    });

    $('#datepicker input').datepicker({
        format: "dd/mm/yy",
        daysOfWeekDisabled: "0",
        autoclose: true,
        language: "es",
        todayHighlight: true
    });

    $('#timepicker input').timepicker();


    //Si nos desconectamos, muestra el log y cambia el mensaje.
    socket.on('disconnect', function () {
        console.log('Desconectado!');
    });


function calendario(stats, array){

    var cal = new CalHeatMap();
    cal.init({
        itemSelector: "#cal",
        domain: "month",
        subDomain: "x_day", //"x_hour",
        subDomainTextFormat: "%d",
        weekStartOnMonday: false,
        range: 4,
        cellSize: 24,
        domainGutter:   5, // separa los meses
        tooltip: true, // muestra el fecha y hora de cada cuadro
        data: stats,
        previousSelector: "#previous",
        nextSelector: "#next",
        highlight: "now", //señala la hora actual.
        legend: array,
        legendCellSize: 15,
        legendColors: {
            min: "#00C322",//"#74D943",//"#00C322",
            max: "#F66F89",//"#EA4868",//"#FF0D00",
            empty: "#95EE6B",//en caso de que sea 0
            base: "#95EE6B",
            overflowing: "#EA4868"
        },
        legendTitleFormat: {
            lower: "menos de {min} {name}",
            inner: "entre {down} y {up} {name}",
            upper: "mas de {max} {name}",
            overflowing: "Tardias"
        },
        itemName: "Evento"
    });
    // cal.highlight(new Date(2014, 5, 18));

    // // // Add January 5th to already highlighted dates
    // cal.highlight(cal.options.highlight.push(new Date(2014, 5, 14)));

};