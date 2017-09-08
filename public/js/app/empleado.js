 $('[name="horario"]').change(function () {
        if($('[name="horario"]').val()!="Sin horario"){
            document.getElementsByName("horarioFijo")[0].disabled = true;
        }
        else {
            document.getElementsByName("horarioFijo")[0].disabled = false;
        }

     });

       $('[name="horarioFijo"]').change(function () {
        if($('[name="horarioFijo"]').val()!="Sin horario"){
            document.getElementsByName("horario")[0].disabled = true;
        }
        else {
            document.getElementsByName("horario")[0].disabled = false;
        }

     });
