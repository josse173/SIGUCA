$(document).ready(function(){


    $('#email').keypress(function(e) {
        if(e.which == 13) {
            $('#email').trigger('focusout');
            return false;
        }
    });
    $('#email').mailgun_validator({
        api_key: 'pubkey-0n7r-abu4ewofp5zxh76nwhr3ch6swj1',
        in_progress: validacionEnProgreso, // called when request is made to validator
        success: validacionExitosa,         // called when validator has returned
        error: validacionError,           // called when an error reaching the validator has occured
    });



});





var keylist="abcdefghijklmnopqrstuvwxyz123456789";
var temp='';
/*var api_key = 'pubkey-0n7r-abu4ewofp5zxh76nwhr3ch6swj1';
var domain = 'gcs@greencore.co.cr';
var mailgun = new Mailgun({apiKey: api_key, domain: domain});


function dataEmail(domain, recipient, msj){
	var data = {
	  from:  domain,
	  to: recipient,
	  subject: msj,
	  text: 'Testing some Mailgun awesomness!'
	};
	return 2;
}


function sendMssg(data){
	mailgun.messages().send(data, function (error, body) {

	});
}*/

// Password Generator when new user is created
function generatepass(plength){
    // var msj = "Manda";
    var correoEmpleado = $("#email").val();
    // var infoEmail = dataEmail(domain, recipient, msj);
    var temp='';
    var contraseña = '';
    for (i=0 ; i<plength; i++){
        temp += keylist.charAt(Math.floor(Math.random()*keylist.length));
    }
    $('#passInputText').css("display","inline");
    $('#passInputText').text(temp);
    $('#passInput').val(temp);
    $('#correoMsj').html('<span class="success">La contraseña generada fue: </span>' + temp )

    //sendMssg(infoEmail);

}

function agregarRolDepartamento(){

    var selectDepartamentos = $('#selectDepartamentos').get(0);
    var selectRoles = $('#selectTipo').get(0);

    if (selectRoles.selectedOptions[0].text !== 'Administrador' && selectRoles.selectedOptions[0].text !== 'Administrador de Reportes'){
        if (selectDepartamentos.selectedOptions[0].text === 'Seleccione una opción' || selectRoles.selectedOptions[0].text === 'Seleccione una opción') {
            alertify.error('Debe seleccionar un departamento y un rol.');
            return;
        }
    }

    if ($('#rolesDepartamento').val() && $('#rolesDepartamento').val() !== '') {

        var selected = $('#rolesDepartamento').val().split("|");
        var agregarlo = true;
        var agregadoAlArray = false;

        selected.forEach(function (select) {

            if(!agregadoAlArray){
                var rd = select.split(";");
                if(rd[0] === selectDepartamentos.selectedOptions[0].value && rd[1] === selectRoles.selectedOptions[0].value ) {
                    alertify.error('La combinación ingresada ya ha sido seleccionada.');
                    agregarlo = false;
                }else{
                    var text = selectDepartamentos.selectedOptions[0].value + ';' + selectRoles.selectedOptions[0].text;
                    selected.push(text);
                    agregadoAlArray = true;
                }
            }
        });

        if(agregarlo){
            $('#rolesDepartamento').val(selected.join('|'));
            agregarLi(selectDepartamentos, selectRoles);
        }

    } else {
        agregarLi(selectDepartamentos, selectRoles);
        var text = selectDepartamentos.selectedOptions[0].value + ';' + selectRoles.selectedOptions[0].text;
        $('#rolesDepartamento').val(text);
    }
}

function agregarLi(selectDepartamentos, selectRoles){

    var ul = document.getElementById("listDepartamentos");
    var li = document.createElement("li");

    var button = document.createElement("a");
    var text = selectDepartamentos.selectedOptions[0].value + ';' + selectRoles.selectedOptions[0].text;

    li.id = text;
    button.innerHTML = "Eliminar";
    button.classList.add('btn');
    button.classList.add('btn-danger');
    button.style.marginLeft = "5px";
    button.style.marginBottom = "5px";

    button.onclick = function() {

        var selected = $('#rolesDepartamento').val().split("|");
        var index = selected.indexOf(text);
        if (index > -1) {
            selected.splice(index, 1);
        }

        $('#rolesDepartamento').val(selected.join('|'));

        var lis = document.querySelectorAll('#listDepartamentos li');
        for(var i=0; li=lis[i]; i++) {
            if(li.id === text){
                li.parentNode.removeChild(li);
            }
        }
    };
    var text2 = '';
    if (selectRoles.selectedOptions[0].text !== 'Administrador' && selectRoles.selectedOptions[0].text !== 'Administrador de Reportes'){
        text2 = selectDepartamentos.selectedOptions[0].text + ' (' + selectRoles.selectedOptions[0].text + ')';
    } else {
        text2 = selectDepartamentos.selectedOptions[0].value + ' (' + selectRoles.selectedOptions[0].text + ')';
    }

    li.appendChild(document.createTextNode(text2));
    li.appendChild(button);
    ul.appendChild(li);
}


$('#clearLabel').click(function(){
    $('#passInputText').css("display","none");
    $('#passInput').val("");
});

function sendEmail(sender, recipient,mensaje){
    sendRaw( sender ,
        [recipient],
        'From:' + sender +
        '\nTo: ' +  recipient +
        '\nContent-Type: text/html; charset=utf-8' +
        '\nSubject:' + mensaje ,
        function(err) { err && console.log(err) });
}


// while the lookup is performing
function validacionEnProgreso() {
    $('#status').html("<img src='/images/loading.gif' height='16'/>");
}
// if email successfull validated
function validacionExitosa(data) {
    $('#status').html(get_suggestion_str(data['is_valid'], data['did_you_mean']));
}
// if email is invalid
function validacionError(error_message) {
    $('#status').html(error_message);
}

// suggest a valid email
function get_suggestion_str(is_valid, alternate) {
    if (alternate) {
        return '<span class="warning">Quieres decir <em>' + alternate + '</em>?</span>';
    } else if (is_valid) {
        return '<span class="success">Dirección válida.</span>';
    } else {
        return '<span class="error">Dirección inválida.</span>';
    }
}

