var urlHorario = 'asignarHorario';


// A $( document ).ready() block.
$( document ).ready(function() {

    if(document.getElementById("alertas")){
        var alertasPrincipal = document.getElementById("alertas").value;
        if(alertasPrincipal && !(alertasPrincipal === 'undefined')){
            setInterval(validarAlertas, 10000);
        }
    }

    function validarAlertas() {

        var fechaActual = moment().unix();

        var tiempoRespuesta = document.getElementById("tiempoRespuesta").value;
        var alertas = document.getElementById("alertas").value;

        if(alertas && !(alertas === 'undefined') && tiempoRespuesta && !(tiempoRespuesta === 'undefined')){
            var listaAlertas = JSON.parse(alertas);
            var listaAlertasActivas = [];
            listaAlertas.forEach(function(alerta) {
                var fechaAlerta = alerta.fechaAlertaUnix;
                if ( fechaAlerta <= fechaActual && alerta.mostrada === false) {

                    $.ajax({
                        url: "usuarioDisponibleVerAlerta",
                        type: "POST",
                        dataType : "json",
                        data: {usuario: alerta.usuario},
                        success: function(data) {

                            if (data.result && data.result === true) {
                                setTimeout(mostrarAlerta, 20000, tiempoRespuesta, alerta);
                            } else {
                                var fechaTemp = moment.unix(fechaAlerta);
                                fechaTemp.add(5,'minutes');
                                alerta.fechaAlertaUnix = fechaTemp.unix();
                                listaAlertasActivas.push(alerta);
                                document.getElementById("alertas").value = JSON.stringify(listaAlertasActivas);

                                $.ajax({
                                    url: "actualizarAlerta",
                                    type: "POST",
                                    dataType : "json",
                                    data: {id : alerta._id, alerta: alerta},
                                    success: function(data) {},
                                    error: function(){}
                                });
                            }
                        },
                        error: function(){
                        }
                    });

                } else {
                    if (alerta.mostrada === false) {
                        listaAlertasActivas.push(alerta)
                    }
                }
            });

            document.getElementById("alertas").value = JSON.stringify(listaAlertasActivas);
        }
    }

    function closeModal(intervalId){
        $("#mensajeConfirmacionConexion").modal("hide");

        setTimeout(validarPresente, 1000);

        clearInterval(intervalId);
    }

    function mostrarAlerta(tiempoRespuesta, alerta) {

        $("#mensajeConfirmacionConexion").modal("show");
        var intervalId = blinkTab("Confirmación de Conexión");

        setTimeout(closeModal, tiempoRespuesta * 60000, intervalId);

        $.ajax({
            url: "alertaMostrada",
            type: "POST",
            dataType : "json",
            data: {id : alerta._id, usuario: alerta.usuario, tiempoRespuesta: tiempoRespuesta},
            success: function(data) {
                document.getElementById("idEventoTeletrabajo").value = data.id;
            },
            error: function(){
            }
        });

    }

    function validarPresente() {

        $.ajax({
            url: "validarPresente",
            type: "POST",
            dataType : "json",
            data: {id : document.getElementById("idEventoTeletrabajo").value},
            success: function(data) {},
            error: function(){}
        });
    }

    var blinkTab = function(message) {
        var oldTitle = document.title,
            timeoutId,
            blink = function() {
                document.title = document.title == message ? ' ' : message;
                var audio = new Audio('https://www.soundjay.com/button/beep-06.wav');
                audio.type = 'audio/wav';

                var playPromise = audio.play();

                if (playPromise !== undefined) {
                    playPromise.then(function () {
                    }).catch(function (error) {
                    });
                }
            },
            clear = function() {
                clearInterval(timeoutId);
                document.title = oldTitle;
                window.onmousemove = null;
                timeoutId = null;
            };

        if (!timeoutId) {
            timeoutId = setInterval(blink, 1200);
            window.onmousemove = clear;
        }

        return timeoutId;
    };

    function getIPs(callback){

        var ip_dups = {};
        //compatibility for firefox and chrome
        var RTCPeerConnection = window.RTCPeerConnection
            || window.mozRTCPeerConnection
            || window.webkitRTCPeerConnection;
        var useWebKit = !!window.webkitRTCPeerConnection;
        //bypass naive webrtc blocking using an iframe
        if(!RTCPeerConnection){
            //NOTE: you need to have an iframe in the page right above the script tag
            //
            //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
            //<script>...getIPs called in here...
            //
            var win = iframe.contentWindow;
            RTCPeerConnection = win.RTCPeerConnection
                || win.mozRTCPeerConnection
                || win.webkitRTCPeerConnection;
            useWebKit = !!win.webkitRTCPeerConnection;
        }
        //minimal requirements for data connection
        let mediaConstraints = {
            optional: [{SCTPDataChannel : true}]
        };
        var servers = {iceServers: [{urls: "stun:stun.services.mozilla.com"}]};
        //construct a new RTCPeerConnection
        var pc = new RTCPeerConnection(servers, mediaConstraints);
        function handleCandidate(candidate){
            //match just the IP address
            var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
            var ip_addr = ip_regex.exec(candidate)[1];
            //remove duplicates
            if(ip_dups[ip_addr] === undefined)
                callback(ip_addr);
            ip_dups[ip_addr] = true;
        }
        //listen for candidate events
        pc.onicecandidate = function(ice){
            //skip non-candidate events
            if(ice.candidate)
                handleCandidate(ice.candidate.candidate);
        };
        //create a bogus data channel
        pc.createDataChannel("");
        //create an offer sdp
        pc.createOffer(function(result){
            //trigger the stun server request
            pc.setLocalDescription(result, function(){}, function(){});
        }, function(){});
        //wait for a while to let everything done
        setTimeout(function(){
            //read candidate info from local description
            var lines = pc.localDescription.sdp.split('\n');
            lines.forEach(function(line){
                if(line.indexOf('a=candidate:') === 0)
                    handleCandidate(line);
            });
        }, 1000);
    }
    //insert IP addresses into the page
    getIPs(function(ip){
        var li = document.createElement("li");
        li.textContent = ip;
       // document.getElementById("nose").innerHTML=ip;
        if(document.getElementById("ipOrigen")){
            document.getElementById("ipOrigen").value=ip;
            if (ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)){
            }
        }

    });
});


$.each([".btnEntrada",".btnSalida",
    ".btnSalidaAlmuerzo",".btnEntradaAlmuerzo",
    ".btnSalidaReceso",".btnEntradaReceso"],
    function(i, id){

        var cerrado = false;
        $(id).click(function() {
            $.ajax({
                url: "marca",
                type: "POST",
                dataType : "json",
                data: {marca:$(this).val(),ipOrigen:document.getElementById("ipOrigen").value},
                success: function(data) {
                    $("#lblMensajeMarca").text(data.result);
                    $("#mensajeMarca").modal("show");
                    $("#mensajeMarca").fadeIn(1);
                    $("#closeMensajeMarca").click(function(){
                        cerrado = true;
                        if(data.result!="Marca registrada correctamente."){
                            if($(".marcaResponsive").is(":visible")){
                                $("#addMarcaResponsive").modal("show");
                                $("#addMarcaResponsive").fadeIn(1000);
                            }else{
                                $("#addMarca").modal("show");
                                $("#addMarca").fadeIn(1000);
                            }

                        }
                        else {
                            window.location.replace(window.location.href);
                        }
                    });
                    $("#addMarca").fadeOut(500);
                    $("#addMarcaResponsive").fadeOut(500);
                    setTimeout(function() {
                        $("#addMarca").modal("hide");
                        $("#addMarcaResponsive").modal("hide");
                    }, 500);
                    var time = 8000;
                    if(data.result=="Marca registrada correctamente."){
                        time = 4000;
                        $("#lblMensajeMarca").text(data.result+
                            "\n Cuenta con 5 minutos para eliminar la marca, en caso de ser errónea.");
                    }
                    if(data.justificacion && data.justificacion!=""){
                        time = 4000;
                        $("#lblMensajeMarca").text(
                            $("#lblMensajeMarca").text()+
                            "\n ALERTA: Debe justificar un nuevo pendiente. \""+data.justificacion+"\"");
                    }
                    setTimeout(function() {
                        window.location.replace(window.location.href);
                    }, time);
                },
                error: function(){
                    $("#closeMensajeMarca").click(function(){
                        cerrado = true;
                        $("#addMarca").fadeIn(1000);
                        $("#addMarcaResponsive").fadeIn(1000);
                    });
                    $("#addMarca").fadeOut(500);
                    $("#addMarcaResponsive").fadeIn(500);
                    $("#lblMensajeMarca").text("No se pudo contactar con el sistema.\n"+
                        "El error ocurrió al realizar marca y esta no se registró.\n"+
                        "Puede intentar refrescando la página.");
                    $("#mensajeMarca").modal("show");
                }
            });
        });
});

$.each([".btnPresente"],
    function (i, id) {
        $(id).click(function() {
            $.ajax({
                url: "presente",
                type: "POST",
                dataType : "json",
                data: {id: document.getElementById("idEventoTeletrabajo").value},
                success: function(data) {
                    $("#mensajeConfirmacionConexion").modal("hide");
                },
                error: function(){
                    $("#mensajeConfirmacionConexion").modal("hide");
                }
            });
        });
    });

$("#solicitud-extra-form").submit(function(e){
    e.preventDefault();
    $.ajax({
        url: 'solicitud_extra',
        type: 'POST',
        dataType : "json",
        data: $('#solicitud-extra-form').serialize(),
        success: function(data) {
            $("#lblMensajeMarca").text(data.result);
            $("#mensajeMarca").modal("show");
            $("#mensajeMarca").fadeIn(1);
            var cerrado = false;
            $("#closeMensajeMarca").click(function(){
                cerrado = true;
                if(data.result!="Guardado correctamente."){
                    $("#horaExtra").modal("show");
                    $("#horaExtra").fadeIn(1000);
                }
                else {
                    window.location.replace(window.location.href);
                }
            });
            $("#horaExtra").fadeOut(500);
            setTimeout(function() {
                $("#horaExtra").modal("hide");
            }, 500);
            if(data.result=="Guardado correctamente."){
                $("#lblMensajeMarca").text("Solicitud realizada correctamente.");
            }
        },
        error: function(err){
            $("#closeMensajeMarca").click(function(){
                cerrado = true;
                $("#horaExtra").fadeIn(1000);
            });
            $("#horaExtra").fadeOut(500);
            $("#lblMensajeMarca").text("No se pudo contactar con el sistema.\n"+
                "El error ocurrió al realizar la solicitud y esta no se registró.\n"+
                "Puede intentar refrescando la página.");
            $("#mensajeMarca").modal("show");
        }
    });
});

$("#diaFinal,#diaInicio").change(function(e){

    try{

        var selectMotivo = document.getElementById("selectMotivo");
        var selectPermisosSinSalario = document.getElementById("selectPermisosSinSalario");
        var fechaInicio = new Date(document.getElementById("diaInicio").value);

        console.log(selectPermisosSinSalario[selectPermisosSinSalario.selectedIndex].value.split(';')[1]);

        if(selectMotivo.options[selectMotivo.selectedIndex].value === 'Permiso sin goce de salario'){
            if(selectPermisosSinSalario[selectPermisosSinSalario.selectedIndex].value.split(';')[1] !== '1'){
                var cantidadMeses = Number(selectPermisosSinSalario.options[selectPermisosSinSalario.selectedIndex].value.split(';')[1]);
                fechaInicio.setMonth(fechaInicio.getMonth() + cantidadMeses);
                var mes = Number(fechaInicio.getMonth()+1) < 10 ? '0' + Number(fechaInicio.getMonth()+1) : Number(fechaInicio.getMonth()+1);
                document.getElementById("diaFinal").value = fechaInicio.getFullYear() + '-' + mes + '-' +fechaInicio.getDate();
            }
        }

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
        alert(error.message);
    }
});

$("#selectMotivo,#selectPermisosSinSalario").change(function(e){

    try{
        var selectMotivo = document.getElementById("selectMotivo");

        if(selectMotivo.options[selectMotivo.selectedIndex].value === 'Permiso sin goce de salario'){

            if(document.getElementById("diaInicio").value){
                var fechaInicio = new Date(document.getElementById("diaInicio").value);

                var selectPermisosSinSalario = document.getElementById("selectPermisosSinSalario");

                var cantidadMeses = Number(selectPermisosSinSalario.options[selectPermisosSinSalario.selectedIndex].value.split(';')[1]);
                fechaInicio.setMonth(fechaInicio.getMonth() + cantidadMeses);
                var mes = Number(fechaInicio.getMonth()+1) < 10 ? '0' + Number(fechaInicio.getMonth()+1) : Number(fechaInicio.getMonth()+1);
                document.getElementById("diaFinal").value = fechaInicio.getFullYear() + '-' + mes + '-' +fechaInicio.getDate();

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
        } else if(selectMotivo.options[selectMotivo.selectedIndex].value === 'Salida-Visita (INS)'){
            jQuery('#diaInicio').datetimepicker({
                format: 'Y-m-d H:i:00',
                timepicker:true,
                onShow:function( ct ){
                    this.setOptions({
                        maxDate:jQuery('#diaFinal').val()?jQuery('#diaFinal').val():false
                    })
                }
            });
            jQuery('#diaFinal').datetimepicker({
                format: 'Y-m-d H:i:00',
                timepicker:true,
                onShow:function( ct ){
                    this.setOptions({
                        minDate:jQuery('#diaInicio').val()?jQuery('#diaInicio').val():false
                    })
                }
            });
        }else{
            jQuery('#diaInicio').datetimepicker({
                format:'Y-m-d',
                timepicker:false,
                onShow:function( ct ){
                    this.setOptions({
                        maxDate:jQuery('#diaFinal').val()?jQuery('#diaFinal').val():false
                    })
                }
            });
            jQuery('#diaFinal').datetimepicker({
                format: 'Y-m-d',
                timepicker:false,
                onShow:function( ct ){
                    this.setOptions({
                        minDate:jQuery('#diaInicio').val()?jQuery('#diaInicio').val():false
                    })
                }
            });
        }
    }catch(error){
        // alert(error.message);
    }
});
