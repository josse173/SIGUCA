$("#diaFinal,#diaInicio").change(function(e){

    try{
        var fecha1 = new Date(document.getElementById("diaInicio").value);
        var fecha2 = new Date(document.getElementById("diaFinal").value);
        var diasDif = fecha2.getTime() - fecha1.getTime();
        var dias = Math.round(diasDif/(1000 * 60 * 60 * 24));

        dias++;
        if(dias && dias!= null){
            document.getElementById("lblnumDias").innerHTML = "Días: " + dias;
            document.getElementById("cantidadDias").value = dias;
        }


    }catch(error){
        // alert(error.message);
    }
});

$("#selectPermisosSinSalario").change(function(e){

    try{
        var selectMotivo = document.getElementById("selectMotivo");

        if(selectMotivo.options[selectMotivo.selectedIndex].value === 'Permiso sin goce de salario'){

            if(document.getElementById("diaInicio").value){
                var fechaInicio = new Date(document.getElementById("diaInicio").value);

                var selectPermisosSinSalario = document.getElementById("selectPermisosSinSalario");

                var cantidadMeses = Number(selectPermisosSinSalario.options[selectPermisosSinSalario.selectedIndex].value.split(';')[1]);
                fechaInicio.setMonth(fechaInicio.getMonth() + cantidadMeses);
                var mes = Number(fechaInicio.getMonth()+1) < 10 ? '0' + Number(fechaInicio.getMonth()+1) : Number(fechaInicio.getMonth()+1);
                document.getElementById("diaFinal").value = fechaInicio.getFullYear() + '/' + mes + '/' +fechaInicio.getDate();

                var fecha1 = new Date(document.getElementById("diaInicio").value);
                var fecha2 = new Date(document.getElementById("diaFinal").value);
                var diasDif = fecha2.getTime() - fecha1.getTime();
                var dias = Math.round(diasDif/(1000 * 60 * 60 * 24));

                dias++;
                if(dias && dias!= null){
                    document.getElementById("lblnumDias").innerHTML = "Días: " + dias;
                    document.getElementById("cantidadDias").value = dias;
                }
            }
        }
    }catch(error){
        // alert(error.message);
    }
});
