var moment 	= require('moment');
module.exports = {
	
	/*
	*  Resultados de configuracion y reportes se filtran por supervisor, finalmente se direcciona a la página 
	*  correspondiente, donde se gestionaran cada uno de los resultados. 
	*/
	eventosAjuste: function (evento, supervisor, query){
		var notFound = true;
		var array = [];
		var count = 0;
	    /*
	    *   - Busca cada evento en cada departamento, convierte el epoch a fecha estándar
	    *    y convierte el epoch de la cantidad de horas a formato hh:mm.
	    */
	    for(var x = 0; x < evento.length; x++){
	    	for(var y = 0; y < supervisor.departamentos.length; y++){
	    		if("fechaCreada" in evento[x]){
	    			var epochTime = evento[x].fechaCreada;
	    			var fecha = new Date(0);
	    			fecha.setUTCSeconds(epochTime); 
	    			evento[x].fecha = fecha;
	    		}
	    		if("cantidadHoras" in evento[x]){
	    			var  s = evento[x].cantidadHoras;
	    			var h  = Math.floor( s / ( 60 * 60 ) );
	    			s -= h * ( 60 * 60 );
	    			var m  = Math.floor( s / 60 );
	    			if(m < 10)
	    				evento[x].cantHoras = h + ":0" + m;
	    			else
	    				evento[x].cantHoras = h + ":" + m;

	    		} 
	    		if("epoch" in evento[x]){
	    			var epochTime = evento[x].epoch;
	    			var fecha = new Date(0);
	    			fecha.setUTCSeconds(epochTime);
	    			if("escritorioEmpl" === query){
	    				var m = fecha.getMinutes(),
	    				s = fecha.getSeconds();

	    				evento[x].fecha = ""+fecha.getHours();
	    				m < 10 ? evento[x].fecha += ":0" + m : evento[x].fecha += ":" + m ;
	    				s < 10 ? evento[x].fecha += ":0" + s : evento[x].fecha += ":" + s ;
	    			} else{
	    				evento[x].fecha = fecha;
	    			}
	    		}
	    		if("eventosEmpl" != query && 
	    			"filtrarEventosEmpl" != query &&
	    			"escritorioEmpl" != query){
	    			if("usuario" in evento[x]){
	    				if("reportes" == query){
	    					if(JSON.stringify(evento[x].usuario.departamentos[0].departamento) === 
	    						JSON.stringify(supervisor.departamentos[y].departamento) 
	    						&& notFound){
	    						count++;
	    						//
	    						notFound = false;
	    						array.push(evento[x]);
	    					} 
	    					if(JSON.stringify(evento[x].usuario.tipo) === 
	    						JSON.stringify("Supervisor")  && notFound){
	    						count++;
	    						//
	    						notFound = false;
	    						array.push(evento[x]);
	    					}   
	    				} else {
	    					if(JSON.stringify(evento[x].usuario.departamentos[0].departamento) 
	    						=== JSON.stringify(supervisor.departamentos[y].departamento) 
	    						&& JSON.stringify(evento[x].usuario._id) 
	    						!= JSON.stringify(supervisor._id) && notFound){
	    						array.push(evento[x]);
	    						//
	    						count++;
	    						notFound = false;
	    					} 
	    					if(JSON.stringify(evento[x].usuario.tipo) === JSON.stringify("Supervisor") 
	    						&& JSON.stringify(evento[x].usuario._id) != JSON.stringify(supervisor._id) && notFound){
	    						array.push(evento[x]);
	    						//
	    						count++;
	    						notFound = false;
	    					}
	    					//
	    				}
	    			} else {
			            /*
			            *   - Filtra los usuarios por supervisor, sin mostrarse el mismo.
			            *   - Se utiliza en los reportes.
			            */
			            if("reportes" == query){
			            	if(JSON.stringify(evento[x].departamentos[0].departamento) === JSON.stringify(supervisor.departamentos[y].departamento) 
			            		&& notFound){
			            		array.push(evento[x]);
			            		//
			            		notFound = false;
			            	} 
			            	if(JSON.stringify(evento[x].tipo) === JSON.stringify("Supervisor") 
			            		&& notFound){
			            		array.push(evento[x]);
			            		//
			            		notFound = false;
			            	}
			            } else {
			            	if(JSON.stringify(evento[x].departamentos[0].departamento) === JSON.stringify(supervisor.departamentos[y].departamento) 
			            		&& JSON.stringify(evento[x]._id) != JSON.stringify(supervisor._id) && notFound){
			            		array.push(evento[x]);
			            		//
			            		notFound = false;
			            	} 
			            	if(JSON.stringify(evento[x].tipo) === JSON.stringify("Supervisor") 
			            		&& JSON.stringify(evento[x]._id) != JSON.stringify(supervisor._id) && notFound){
			            		array.push(evento[x]);
			            		//
			            		notFound = false;
			            	}
			            }
			        }
			    } else {
			    	array.push(evento[x]);
			    }
            }//for
            notFound = true;
        }//for
        if("count" === query){
        	return count;
        }
        return array;
    },
    ajustarHoras: function (total, ajuste){
    	if(total.m<ajuste.m){
    		total.m = 60 -(ajuste.m-total.m);
    		total.h = total.h-(ajuste.h + 1);
    	}
    	else{
    		total.m = total.m-ajuste.m;
    		total.h = total.h-ajuste.h;
    	}
    	//console.log("ajustarHoras: "+JSON.stringify(total));
    	return total;
    },
    contarHoras: function (inicio, fin){
    	var actualEpoch = moment();
    	var conteo = {h:0, m:0};
    	if(inicio && fin){
    		var hInicio = moment.unix(inicio.epoch);
    		var hFin = moment.unix(fin.epoch);
    		conteo.h = hFin.hours()-hInicio.hours();
    		if(conteo.h==1 && hInicio.minutes() >hFin.minutes()){
    			conteo.h = 0;
    		}
    		if(hInicio.minutes()>hFin.minutes()){
    			var dif = 60 - hInicio.minutes() +hFin.minutes();
    			conteo.m = dif;
    		}
    		else conteo.m = hFin.minutes()-hInicio.minutes();
    	}else if(inicio){
    		var hInicio = moment.unix(inicio.epoch);
    		conteo.h = actualEpoch.hours()-hInicio.hours();
    		if(conteo.h==1 && hInicio.minutes() >actualEpoch.minutes()){
    			conteo.h = 0;
    		}
    		if(hInicio.minutes()>actualEpoch.minutes()){
    			var dif = 60 - hInicio.minutes() +actualEpoch.minutes();
    			conteo.m = dif;
    		}
    		else conteo.m = actualEpoch.minutes()-hInicio.minutes();
    	}
    	return conteo;
    },
    clasificarMarcas:function (arrayMarcas){
    	var marcas = {
    		entrada:null,salida:null,
    		almuerzoIn:null, almuerzoOut:null,
    		recesoIn:null, recesoOut:null
    	};
    	for(marca in arrayMarcas){
    		if(arrayMarcas[marca].tipoMarca=="Entrada"){
    			marcas.entrada = arrayMarcas[marca];
    		}
    		else if(arrayMarcas[marca].tipoMarca=="Salida"){
    			marcas.salida = arrayMarcas[marca];
    		}
    		else if(arrayMarcas[marca].tipoMarca=="Salida a Receso"){
    			marcas.recesoOut = arrayMarcas[marca];
    		}
    		else if(arrayMarcas[marca].tipoMarca=="Salida al Almuerzo"){
    			marcas.almuerzoOut = arrayMarcas[marca];
    		}
    		else if(arrayMarcas[marca].tipoMarca=="Entrada de Receso"){
    			marcas.recesoIn = arrayMarcas[marca];
    		}
    		else if(arrayMarcas[marca].tipoMarca=="Entrada de Almuerzo"){
    			marcas.almuerzoIn = arrayMarcas[marca];
    		}
    	}
    	return marcas;
    }
}