$('#btnAgregarPeriodo').click(function(){
    var id= $('#btnAgregarPeriodo').val();
    $.get('/periodos/vacacionesAcumuladas/'+id, function(data) {
        $('#diasAcumulados').val(data);
    });
    var id= $('#btnAgregarPeriodo').val();
    $.get('/periodos/numero/'+id, function( data ) {
        var numeroPeriodo= parseInt(data.numeroPeriodo);
        numeroPeriodo = numeroPeriodo+1;
        $('#numeroPeriodo').val(numeroPeriodo);
    });

    //Cantidad de periodos que ha tenido una persona
    $.get('/periodos/cantidadVacaciones/'+id, function( data ) {
        //var numeroPeriodo= parseInt(data.numeroPeriodo);
        //$('#numeroPeriodo').val(numeroPeriodo);
    });
});
