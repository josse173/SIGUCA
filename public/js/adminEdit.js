 'use strict';

    $('.footable').footable();

	$("button[data-target=#editDep]").click( function() {
        var id = $(this).val();
        $('.formUpdate').attr('action', '/departamento/'+id);

        $.get('/departamento/editDepartamento/'+id, function( data ) {
            $('#nombreDepa').val(data.nombre);            
        });
	});

	$("button[data-target=#editHorario]").click( function() {
        var id = $(this).val();
        $('.formUpdate').attr('action', '/horarioN/'+id);

        $.get('/horarioN/editHorario/'+id, function( data ) {
            $('#nombre').val(data.nombre);            
            $('#tipoJornada').val(data.tipo);            
            if(data.tipo == 'Libre'){
            	$('#tipoJornada').prop('checked', true);
	            $('#timepicker input').attr('disabled','disabled');
	            $('#timepicker1 input').attr('disabled','disabled');
            	$('#timepicker4').show();
            	$('#rangoJornada').hide();
            }
            else{
            	$('#tipoJornada').prop('checked', false);
	            $('#timepicker input').removeAttr('disabled');
	            $('#timepicker1 input').removeAttr('disabled');
	            $('#rangoJornada').show();
	            $('#timepicker4').hide();
            }
            $('#horaEntrada').val(data.horaEntrada);            
            $('#horaSalida').val(data.horaSalida);            
            $('#rangoJornada').text(data.rangoJornada);            
            $('#inputRango').val(data.rangoJornada); 
            $('#tiempoReceso').val(data.tiempoReceso); 
            $('#tiempoAlmuerzo').val(data.tiempoAlmuerzo); 
        });
	});

	$("button[data-target=#editEmpl]").click( function() {
        var id = $(this).val();
        $('.formUpdate').attr('action', '/empleado/'+id);

        $.get('/empleado/edit/'+id, function( data ) {
            $('#nombre').val(data.nombre);            
            $('#cedula').val(data.cedula);            
            $('#apellido1').val(data.apellido1);            
            $('#apellido2').val(data.apellido2);            
            $('#email').val(data.email);            
            $('#codTarjeta').val(data.codTarjeta);            
            $('#username').val(data.username);     
            $('#selectTipo').selectpicker('val', data.tipo);       
            $('#selectHorario').selectpicker('val', data.horario);       
            $('#selectDepartamentos').selectpicker('val', data.horario);    

            var val = [];
            for (var i = 0; i < data.departamentos.length; i++) {
                val.push(data.departamentos[i].departamento);
            }
            $('#selectDepartamentos').selectpicker('val', val);
            $('#selectDepartamentos').selectpicker('refresh');    
            $('#selectHorario').selectpicker('refresh');    
            $('#selectTipo').selectpicker('refresh');    

        });
	});
