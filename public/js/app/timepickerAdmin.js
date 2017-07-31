
    $('#timepicker input').timepicker('setTime', '0:00');
    $('#timepicker1 input').timepicker('setTime', '0:00');
    $('#timepicker2 input').timepicker('setTime', '0:45');
    $('#timepicker3 input').timepicker('setTime', '1:00');
    $('#timepicker4 input').timepicker('setTime', '0:15');
    $('#timepicker5 input').timepicker('setTime', '0:15');

    $('#timepicker span').timepicker('setTime', '8:00');
    $('#timepicker1 span').timepicker('setTime', '17:00');
    $('#timepicker2 span').timepicker('setTime', '0:45');
    $('#timepicker3 span').timepicker('setTime', '1:00');
    $('#timepicker4 span').timepicker('setTime', '0:00');
    $('#rangoJornada').text("9:00");
    
    $('#tipoJornada').val('Fijo');
    $('#timepicker4').hide();
    $('#jornadaLibreDiv').hide(); 

    $('#timepicker input').change(function () {
    	rangoJornada();
    });

    $('#timepicker1 input').change(function () {
    	rangoJornada();
    });

    function rangoJornada(){

        var hmsInicio = $('#timepicker input').val(); 
        var aInicio = hmsInicio.split(':'); 
        var sInicio = (+aInicio[0]) * 60 * 60 + (+aInicio[1]) * 60 + 00; 

        var hmsFinal = $('#timepicker1 input').val();  
        var aFinal = hmsFinal.split(':'); 
        var sFinal = (+aFinal[0]) * 60 * 60 + (+aFinal[1]) * 60 + 00; 

        var s = sFinal - sInicio;
        var h  = Math.floor( s / ( 60 * 60 ) );
            s -= h * ( 60 * 60 );
        var m  = Math.floor( s / 60 );
        if(m < 10)
        	$('#rangoJornada').text(h + ":0" + m);
        else
        	$('#rangoJornada').text(h + ":" + m);

        $('#inputRango').val($('#rangoJornada').text());
    }

    $('#tipoJornada').change(function () {
        if($('#tipoJornada').is(':checked')){
            $('#timepicker input').attr('disabled','disabled');
            $('#timepicker1 input').attr('disabled','disabled');
            $('#rangoJornada').hide();
            $('#timepicker4').show();
            $('#jornadaLibreDiv').show(); 
            $('#tipoJornada').val('Libre');
        } else {
            $('#timepicker input').removeAttr('disabled');
            $('#timepicker1 input').removeAttr('disabled');
            $('#rangoJornada').show();
            $('#timepicker4').hide();
            $('#jornadaLibreDiv').hide(); 
            $('#tipoJornada').val('Fijo');
        }
    });
      $('#jornadaLibre').change(function () {
        if($('#jornadaLibre').is(':checked')){
            $('#timepicker4 input').attr('disabled','disabled');
        } else {
            $('#timepicker4 input').removeAttr('disabled');
           
        }
    });


    // $('#selectTipo').change(function () {
    //     var val = $('#selectTipo').val()
    // 	if(val === 'Supervisor'){
    // 		$('#selectDepartamento').attr('multiple','multiple');
    // 	}
    // 	else{
    // 		$('#selectDepartamento').removeAttr('multiple');
    // 	}
    // });
