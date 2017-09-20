var socket = io.connect('http://siguca.greencore.int');
//var socket = io.connect('http://10.42.30.19:3000');
//REVISAR IP
socket.emit('connected');

//Si estamos conectados, muestra el log y cambia el mensaje
socket.on('connected', function (epoch) {
    selectValue();
    clock(epoch);
    updateHorasTrabajadas();
    
    
});

$('#btnIr').click(function(){
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
                        $("<td></td>").text(data.marcas[m].fecha.hora)));
               }               
            }
            $(".hideDisplay").css("display","inline-flex");
            $(".qwer").html("");
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

                var cantidadFinal= horas+":"+minutos;
                $(".qwer").text(cantidadFinal); 
 
             
            }
        },
        error: function(){
            alert("Error.");
        }

    });  
});


/*
 $("#btnIr").click(function(){
    $.ajax({
        url: "/marca/get",
        type: 'POST',
        dataType : "json",
        data: {"date":$('#date_range_marca').val()},
        success: function(data) {
            
        }//fin
        error: function(){
            alert("Error.");
        }    
});
    */



$("checkJustificacion").click(function(){
		//alert('Evento click sobre un input text con nombre="nombre1"');
});

$('#cerrarPanel').click(function(){
 $(".hideDisplay").css("display","none");
});

$(document).ready(function()
{  
   var codigo = $( "#codigoUsuario").text();
   $("#imagenPerfil").prop("src","/uploads/"+codigo+".png");

})



function selectValue(){
    var value = $('#selectFiltro').val();
    socket.emit('listar', value);
}

function clock(epoch){
    setInterval(function(){
        var currentTime = new Date(0);

        currentTime.setUTCSeconds(epoch)
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

$('#selectFiltro').change(function(){
    $('#cal').empty();
    selectValue();
});

$('#selectMotivo').change(function (){
    if($('#selectMotivo').val() == 'otro') $("#motivoOtro").removeAttr('disabled');
    else $("#motivoOtro").attr('disabled','disabled');
});

$('#selectMotivoJust').change(function (){
    if($('#selectMotivoJust').val() == 'otro') $("#motivoOtroJust").removeAttr('disabled');
    else $("#motivoOtroJust").attr('disabled','disabled');
});


//Si nos desconectamos, muestra el log y cambia el mensaje.
socket.on('disconnect', function () {
    //console.log('Desconectado!');
});


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
            var departamento = $('#selectFiltro').val();
            var usuario = $('#btn-marca').val();
            $.get('/reportarEventos', {dia: date, departamentoId: departamento, id: usuario}, function( data ) {
                $( "#calDetalle" ).html('<tr><td> Justificaciones </td><td>' + data.justificaciones+  '</td></tr>' +
                    '<tr><td> Solicitudes </td><td>' + data.solicitudes +  '</td></tr>' +
                    '<tr><td> Ausencias o Tardías </td><td>' + data.marcas + '</td></tr>');
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
