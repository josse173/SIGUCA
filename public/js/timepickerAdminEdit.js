    $('#timepicker input').timepicker();
    $('#timepicker1 input').timepicker();
    $('#timepicker2 input').timepicker();
    $('#timepicker3 input').timepicker();
    $('#timepicker4 input').timepicker();

    if($('#tipoJornada').val() === 'Fijo'){
        $('#rangoJornada').show();
        $('#timepicker4').hide();
    } else {
        $('#timepicker4').show();
        $('#rangoJornada').hide();
        $('#timepicker input').attr('disabled','disabled');
        $('#timepicker1 input').attr('disabled','disabled');
    }

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
            $('#tipoJornada').val('Libre');
        } else {
            $('#timepicker input').removeAttr('disabled');
            $('#timepicker1 input').removeAttr('disabled');
            $('#rangoJornada').show();
            $('#timepicker4').hide();
            $('#tipoJornada').val('Fijo');
        }
    });

    // $('#selectTipo').change(function () {
    // 	if($('#selectTipo option[value=Supervisor]:selected')){
    // 		$('#selectDepartamento').attr('multiple','multiple');
    // 	}
    // 	else{
    // 		$('#selectDepartamento').removeAttr('multiple');
    // 	}
    // });
