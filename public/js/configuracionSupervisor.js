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