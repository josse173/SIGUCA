
    //Declaramos el objeto socket que se conectará en este caso a localhost
    //var socket = io.connect('http://siguca.greencore.int');
    var socket = io.connect('http://localhost:3000');
	

	socket.on('connected', function () {
        
    });

	$('.deleteHorario').click(function(){
		var horarioId = $(this).val();
		socket.emit('eliminarHorario', horarioId);
	});

	$('.deleteDepartamento').click(function(){
		var departamentoId = $(this).val();
		socket.emit('eliminarDepartamento', departamentoId);
	});

	socket.on('notificar', function (msg) {
        alertify.error(msg);
    });

	socket.on('reload', function (msg) {
        location.reload();
        alertify.log(msg);
    });