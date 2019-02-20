//var socket = io.connect('http://siguca.greencore.int');
var socket = io.connect('http://localhost:3000');
//REVISAR IP
socket.emit('connected');


function selectValue(){
    var value = $('#selectFiltro').val();
    //alert(value);
    socket.emit('listar', value);
}


function clock(epoch){
    setInterval(function(){
        var currentTime = new Date(0);
        currentTime.setUTCSeconds(epoch);
        var currentHours = currentTime.getHours ( );
        var currentMinutes = currentTime.getMinutes ( );
        var currentSeconds = currentTime.getSeconds ( );

        // Pad the minutes and seconds with leading zeros, if required
        currentMinutes = ( currentMinutes < 10 ? "0" : "" ) + currentMinutes;
        currentSeconds = ( currentSeconds < 10 ? "0" : "" ) + currentSeconds;

        // Choose either "AM" or "PM" as appropriate
        var timeOfDay = ( currentHours < 12 ) ? "AM" : "PM";

         // Convert the hours component to 12-hour format if needed
         currentHours = ( currentHours > 12 ) ? currentHours - 12 : currentHours;

        // Convert an hours component of "0" to "12"
        currentHours = ( currentHours == 0 ) ? 12 : currentHours;

        // Compose the string for display
        var currentTimeString = currentHours + ":" + currentMinutes + ":" + currentSeconds + " " + timeOfDay;

        // Update the time display
        $(".clock").text(currentTimeString);
        if(epoch%60==0)
            updateHorasTrabajadas();
        epoch++;
    }, 1000 );
}


function updateHorasTrabajadas(){
    $.get("horas/actualizar", function( data ) {
        var currentHours = data.h;
        var currentMinutes = data.m;
        currentHours = ( currentHours < 10 ? "0" : "" ) + currentHours;
        currentMinutes = ( currentMinutes < 10 ? "0" : "" ) + currentMinutes;
        $(".clockHorasTrab").text(
            ""+currentHours+ "h y "+currentMinutes+"m");
    });
}


$('#btn-marca').click(function(){
    $.ajax({
        url: "/marcaCheck",
        type: 'POST',
        dataType : "json",
        success: function(data) {
        var contEntrada=0;
        var contSalida=0;
        for(m in data.marcas){

            if(data.marcas[m].tipoMarca=='Salida'){
                document.getElementById("btnSalida").disabled=true;
                document.getElementById("btnEntrada").disabled=true;
                document.getElementById("btnSalidaAlmuerzo").disabled=true;
                document.getElementById("btnEntradaAlmuerzo").disabled=true;
                document.getElementById("btnSalidaReceso").disabled=true;
                document.getElementById("btnEntradaReceso").disabled=true;
            }
            else if(data.marcas[m].tipoMarca=='Entrada'){
                document.getElementById("btnEntrada").disabled=true;
            }

            else if(data.marcas[m].tipoMarca=='Salida a Receso'){
                contSalida++;
            }
            else if(data.marcas[m].tipoMarca=='Entrada de Receso'){
                contEntrada++;

            }
            else if(data.marcas[m].tipoMarca=='Salida al Almuerzo'){
                document.getElementById("btnSalidaAlmuerzo").disabled=true;
            }
            else if(data.marcas[m].tipoMarca=='Entrada de Almuerzo'){
                document.getElementById("btnEntradaAlmuerzo").disabled=true;
            }

        }
        if(contSalida>contEntrada){
            document.getElementById("btnSalidaReceso").disabled=true;
        }

        }});


});

$('#btnIr').click(function(){
    if($('#date_range_end').val()!="" &&  $('#date_range_marca').val()!=""){
        var obj=new Object();
        obj.inicio=$('#date_range_marca').val();
        obj.final=$('#date_range_end').val();
        $.ajax({
            url: "/rango/get",
            type: 'POST',
            dataType : "json",
            data: {"fecha":obj},
            success: function(data) {
                if(data.result=="ok"){
                    var horas=0, minutos=0;
                    for(var i=0;i<data.lista.length;i++){
                        horas=horas+data.lista[i].horas;
                        minutos=minutos+data.lista[i].minutos;
                    }
                    while(minutos>59){
                        horas++;
                        minutos=minutos-60;
                    }

                    if(minutos<10){
                        minutos = "0"+minutos;
                    }
                    if(horas<10){
                        horas = "0"+horas;
                    }

                    $(".hideDisplay").css("display","inline-flex");
                    $(".qwer").html("");
                    var cantidadFinal= horas+":"+minutos;
                    $(".qwer").text(cantidadFinal);
                    $("#date_range_marca").val("");
                    $("#date_range_end").val("");

                }else{
                    $(".hideDisplay").css("display","inline-flex");
                    $(".qwer").html("");
                    var cantidadFinal= 0+":"+0+""+0;
                    $(".qwer").text(cantidadFinal);
                }


            }
            ,error: function(){
                alert("Error.");
            }
        });




    }
    else{
    $.ajax({
        url: "/marca/get",
        type: 'POST',
        dataType : "json",
        data: {"date":$('#date_range_marca').val()},
        success: function(data) {
            $("#marcasBody").html("");
            if(data.result!="error"){
                for(m in data.marcas){
                   $("#marcasBody").append($("<tr></tr>")
                    .append(
                        $("<td></td>").text(data.marcas[m].tipoMarca))
                    .append(
                        $("<td></td>").text(data.marcas[m].fecha.hora))

                    );
               }
            }
            $(".hideDisplay").css("display","inline-flex");
            $(".qwer").html("");
            $(".qwer").text(0+""+0+":"+""+0+""+0);
            if(data.result!="error"){
                for(m in data.marcas){
                    if(data.marcas[m].tipoMarca=='Entrada'){
                        var tiempoEntrada = data.marcas[m].fecha.hora
                    }
                    if(data.marcas[m].tipoMarca=='Salida'){
                        var tiempoSalida = data.marcas[m].fecha.hora
                    }
                    if(data.marcas[m].tipoMarca=='Salida a Receso'){
                        var tiempoSalidaReceso = data.marcas[m].fecha.hora
                    }
                    if(data.marcas[m].tipoMarca=='Entrada de Receso'){
                        var tiempoEntradaReceso = data.marcas[m].fecha.hora
                    }
                    if(data.marcas[m].tipoMarca=='Salida al Almuerzo'){
                        var tiempoSalidaAlmuerzo = data.marcas[m].fecha.hora
                    }
                    if(data.marcas[m].tipoMarca=='Entrada de Almuerzo'){
                        var tiempoEntradaAlmuerzo = data.marcas[m].fecha.hora
                    }
                    }


                inicioMinutos = parseInt(tiempoEntrada.substr(3,2));

                inicioHoras = parseInt(tiempoEntrada.substr(0,2));
                finMinutos = parseInt(tiempoSalida.substr(3,2));

                finHoras = parseInt(tiempoSalida.substr(0,2));
                transcurridoMinutos = finMinutos - inicioMinutos;
                transcurridoHoras = finHoras - inicioHoras;  //bloque de salida y entrada

                if(tiempoSalidaReceso!=null){
                var inicioRecesoMinutos = parseInt(tiempoSalidaReceso.substr(3,2));
                var inicioRecesoHoras = parseInt(tiempoSalidaReceso.substr(0,2));
                var finRecesoMinutos = parseInt(tiempoEntradaReceso.substr(3,2));
                var finRecesoHoras = parseInt(tiempoEntradaReceso.substr(0,2));
                var transcurridoRecesoMinutos = finRecesoMinutos - inicioRecesoMinutos;
                var transcurridoRecesoHoras = finRecesoHoras - inicioRecesoHoras;//bloque para recesos
                }else{
                    transcurridoRecesoHoras = 0;
                    transcurridoRecesoMinutos = 0;
                }
                if(tiempoSalidaAlmuerzo!=null){
                var inicioAlmuerzoMinutos = parseInt(tiempoSalidaAlmuerzo.substr(3,2));
                var inicioAlmuerzoHoras = parseInt(tiempoSalidaAlmuerzo.substr(0,2));
                var finAlmuerzoMinutos = parseInt(tiempoEntradaAlmuerzo.substr(3,2));
                var finAlmuerzoHoras = parseInt(tiempoEntradaAlmuerzo.substr(0,2));
                var transcurridoAlmuerzoMinutos = finAlmuerzoMinutos - inicioAlmuerzoMinutos;
                var transcurridoAlmuerzoHoras = finAlmuerzoHoras - inicioAlmuerzoHoras;//bloque para almuerzos
                }else{
                    transcurridoAlmuerzoMinutos = 0;
                    transcurridoAlmuerzoHoras = 0;
                }

                var transcurridoHorasTotal = transcurridoHoras - transcurridoRecesoHoras - transcurridoAlmuerzoHoras;
                var transcurridoMinutosTotal = transcurridoMinutos - transcurridoRecesoMinutos - transcurridoAlmuerzoMinutos;


                if (transcurridoMinutosTotal < 0) {
                    transcurridoHorasTotal--;
                    transcurridoMinutosTotal = 60 + transcurridoMinutosTotal;
                }

                horas = transcurridoHorasTotal.toString();
                minutos = transcurridoMinutosTotal.toString();

                if (horas.length < 2) {
                    horas = "0"+horas;
                }

                if (minutos.length < 2) {
                    minutos = "0"+minutos;
                }

                if(minutos>59){
                    horas++;
                    minutos=minutos-60;
                }

                //alert();
                var cantidadFinal= horas+":"+minutos;
                $(".qwer").text(cantidadFinal);


            }
        },
        error: function(){
            alert("Error.");
        }

    });

    }//fin
});
//



$('#cerrarPanel').click(function(){
 $(".hideDisplay").css("display","none");
});

//

$('#selectFiltro').change(function(){
    $('#cal').empty();
    selectValue();
});

$('#selectMotivo').change(function (){
    if($('#selectMotivo').val() != 'Vacaciones')
        $("#selectOpcionesDepartamento").attr('style','display:none') &&
        $("#divPeriodoDescontar").attr('style','display:none');
        $("#divDerechoDisfrutarPorPeriodo").attr('style','display:none');
        $("#divDiasDisfrutadosPorPeriodo").attr('style','display:none') &&
        $("#divTotalDiasDisponibles").attr('style','display:none') &&
        $("#divDiasSolicitadosVacaciones").attr('style','display:none') &&
        $("#divSaldoDisfrutarVacaciones").attr('style','display:none');

    if($('#selectMotivo').val() != 'Articulo 51')
        $("#selectOpcionesArticulo").attr('style','display:none') &&
        $("#divInciso").attr('style','display:none') &&
        $("#divcantidadDiasDisfrutados").attr('style','display:none') &&
        $("#divcantidadDiasDisponibles").attr('style','display:none') &&
        $("#divcantidadDiasSolicitados").attr('style','display:none') &&
        $("#divsaldoDiasDisfrutar").attr('style','display:none') &&
        $("#divanno").attr('style','display:none');

    if($('#selectMotivo').val() != 'Otro')
        $("#motivoOtro").attr('disabled','disabled');

    if($('#selectMotivo').val() == 'Otro')
        $("#motivoOtro").removeAttr('disabled') &&
        $("#divOtro").attr('style','display:block');

    else if($('#selectMotivo').val() == 'Articulo 51')
        $("#selectOpcionesArticulo").attr('style','display:block') &&
        $("#divOtro").attr('style','display:none');

    else if($('#selectMotivo').val() == 'Vacaciones')
        $("#selectOpcionesDepartamento").attr('style','display:block') &&
        $("#divPeriodoDescontar").attr('style','display:block') &&
        $("#divDerechoDisfrutarPorPeriodo").attr('style','display:block') &&
        $("#divDiasDisfrutadosPorPeriodo").attr('style','display:block') &&
        $("#divTotalDiasDisponibles").attr('style','display:block') &&
        $("#divDiasSolicitadosVacaciones").attr('style','display:block') &&
        $("#divSaldoDisfrutarVacaciones").attr('style','display:block') &&
        $("#divOtro").attr('style','display:none');
    else if($('#selectMotivo').val() == 'Permiso sin goce de salario')
        $("#selectOpcionesPermisosSinSalario").attr('style','display:block') &&
        $("#diaFinal").attr('disabled','disabled');
    if($('#selectMotivo').val() !== 'Permiso sin goce de salario')
        $("#selectOpcionesPermisosSinSalario").attr('style','display:none') &&
        $("#diaFinal").attr('disabled',false);
});

$('#selectDerechoDisfrutar').change(function (){
    if($('#selectDerechoDisfrutar').val() != 'Diligencias') $("#divInciso").attr('style','display:none') && $("#divcantidadDiasDisfrutados").attr('style','display:none') &&
    $("#divcantidadDiasDisponibles").attr('style','display:none') && $("#divcantidadDiasSolicitados").attr('style','display:none') &&
    $("#divsaldoDiasDisfrutar").attr('style','display:none') && $("#divanno").attr('style','display:none');
    if($('#selectDerechoDisfrutar').val() == 'Matrimonio') $("#selectInciso").val('Inciso A') && $("#divInciso").attr('style','display:block');
    else if($('#selectDerechoDisfrutar').val() == 'Fallecimiento') $("#divInciso").attr('style','display:block') && $("#selectInciso").val('Inciso A');
    else if($('#selectDerechoDisfrutar').val() == 'Nacimiento Hijo') $("#divInciso").attr('style','display:block') && $("#selectInciso").val('Inciso B');
    else if($('#selectDerechoDisfrutar').val() == 'Diligencias') { $("#divInciso").attr('style','display:block') && $("#selectInciso").val('Inciso C') &&
    $("#divcantidadDiasDisfrutados").attr('style','display:block') && $("#divcantidadDiasDisponibles").attr('style','display:block') &&
    $("#divcantidadDiasSolicitados").attr('style','display:block') && $("#divsaldoDiasDisfrutar").attr('style','display:block') &&
    $("#divanno").attr('style','display:block');
        var usuario = $('#btn-marca').val();
        $.get('/solicitud/inciso', {id: usuario}, function( data ) {
            var cantidad = data.quantity.length;
            var diasDisfrutados = data.quantity;
            var dias = new Array();
            diasDisfrutados.forEach(function (objeto, index) {
                    dias[index] = objeto.diaInicio;
            });
            var diasT = dias.toString();
            $("#cantidadDiasDisfrutados" ).val(cantidad);
            $("#saldoDiasDisfrutar" ).val("Dias solicitados:" + diasT);
            if(cantidad >= 3){
                $("#cantidadDiasDisponibles" ).val(0);
            } else  $("#cantidadDiasDisponibles" ).val(3 - cantidad);
        });
    }
});

$('#selectMotivoJust').change(function (){
    if($('#selectMotivoJust').val() == 'Otro') $("#motivoOtroJust").removeAttr('disabled');
    else $("#motivoOtroJust").attr('disabled','disabled');
});

//Si estamos conectados, muestra el log y cambia el mensaje
socket.on('connected', function (epoch) {
    selectValue();
    clock(epoch);
    updateHorasTrabajadas();
});

//Si nos desconectamos, muestra el log y cambia el mensaje.
socket.on('disconnect', function () {
    console.log('Desconectado!');
});

$(document).ready(function()
{
   var codigo = $( "#codigoUsuario").text();
   $("#imagenPerfil").prop("src","/uploads/"+codigo+".png");

})
/*//Se recibe result de la consulta

socket.on('listaCierre', function(cierre){
    alert(cierre);
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
                    stats[result.cierre[d].epoch] = result.cierre[d].justificaci
                else{
                    if(result.tipo == "solicitudes")
                        for (var d in result.cierre)
                            stats[result.cierre[d].epoch] = result.cierre[d].sol
                        else
                            for (var d in result.cierre)
                                stats[result.cierre[d].epoch] = result.cierre[d]
                        }
                    }
        $(".clock").text(currentTimeString);
    }, 1000 );
}
*/


function calendario(stats, array){

    var cal = new CalHeatMap();
    cal.init({
        itemSelector: "#cal",
        domain: "month",
        subDomain: "x_day", //"x_hour",
        subDomainTextFormat: "%d",
        weekStartOnMonday: false,
        range: 1,
        cellSize: 24,
        domainGutter:   5, // separa los meses
        tooltip: true, // muestra el fecha y hora de cada cuadro
        data: stats,
        previousSelector: "#previous",
        nextSelector: "#next",
        highlight: "now", //señala la hora actual.
        label: {
            position: "top"
        },
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
            lower: "Menos de {min} {name}",
            inner: "Entre {down} y {up} {name}",
            upper: "Mas de {max} {name}",
            overflowing: "Tardias"
        },
        legendHorizontalPosition: "right",
        //legendVerticalPosition: "top",
        itemName: "evento",
        onClick: function(date, nb) {
            var usuario = $('#btn-marca').val();
            $.get('/reportarEventos', {dia: date, id: usuario}, function( data ) {
                var html = '';
                for (var i = 0; i < data.marcasPersonales.length; i++) {

                    var fecha = new Date(0);
                    fecha.setUTCSeconds(data.marcasPersonales[i].epoch);
                    var m = fecha.getMinutes(),
                    s = fecha.getSeconds();

                    data.marcasPersonales[i].fecha = fecha.getHours();
                    m < 10 ? data.marcasPersonales[i].fecha += ":0" + m : data.marcasPersonales[i].fecha += ":" + m ;
                    s < 10 ? data.marcasPersonales[i].fecha += ":0" + s : data.marcasPersonales[i].fecha += ":" + s ;
                    html += '<tr><td>' + data.marcasPersonales[i].tipoMarca + '</td><td>' + data.marcasPersonales[i].fecha + '</td></tr>';
                };
                $( ".marcasDetalle" ).html(html);
            });

        }
    });
};
