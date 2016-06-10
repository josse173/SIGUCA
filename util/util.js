var moment 	= require('moment');
module.exports = {
    unixTimeToRegularDate: function(list, detail){
        for(x in list){
            if("cantidadHoras" in list[x]){
                //
                var  s = list[x].cantidadHoras;
                var h  = Math.floor( s / ( 60 * 60 ) );
                s -= h * ( 60 * 60 );
                var m  = Math.floor( s / 60 );
                if(m < 10)
                    list[x].cantHoras = h + ":0" + m;
                else
                    list[x].cantHoras = h + ":" + m;
            } 
            if("fechaCreada" in list[x]){
                var epochTime = list[x].fechaCreada;
                this.epochToStr(list[x], epochTime, detail);
            }
            if("epoch" in list[x]){
                var epochTime = list[x].epoch;
                this.epochToStr(list[x], epochTime, detail);
                //console.log(list[x].fecha);
            }
            if("fechaJustificada" in list[x]){
                var epochTime = list[x].fechaJustificada;
                this.epochToStr(list[x], epochTime, detail, "fechaJust");
            }
        }
        return list;
    },
    epochToStr : function(obj, epochTime, detail, name){
        var fecha = new moment.unix(epochTime);
        var n = "fecha";
        if(name) n = name;

        if(epochTime==0){
            var f = obj[n] = {
                str:"No hay fecha registrada."
            };
            return f;
        }else{
            var fecha = new moment.unix(epochTime);
            var n = "fecha";
            if(name) n = name;
            var f = obj[n] = {
                    //
                    dia:this.getDia(fecha.day()),
                    diaNum:fecha.date(),
                    mes:this.getMes(fecha.month()),
                    año:fecha.year(),
                    hora: fecha.hours(),
                    minutos: fecha.minutes(),

                };
            //
            f.str = f.diaNum+" de "+f.mes+" del "+f.año;
            if (detail){
                f.str = f.str+", "+this.ajustarCero(f.hora)+":"+this.ajustarCero(f.minutos);
            }
            f.hora = ""+this.ajustarCero(f.hora)+":"+this.ajustarCero(f.minutos);
            return f;
        }

    },
    ajustarCero: function (num){
        if(num<10) return 0+""+num;
        return num;
    },
    getDia: function(d){
        var dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        return dias[d];
    },
    getMes: function(m){
        var meses = [
        "Enero", "Febrero", "Marzo", 
        "Abril", "Mayo", "Junio", 
        "Julio", "Agosto","Setiembre",
        "Octubre", "Noviembre", "Diciembre"
        ];
        return meses[m];
    },
    clasificarMarcas:function (arrayMarcas){
        var marcas = {
            entrada:null,salida:null,
            almuerzoIn:null, almuerzoOut:null,
            recesos : [],
            extras : []
        };
        for(marca in arrayMarcas){
            if(arrayMarcas[marca].tipoMarca=="Entrada"){
                marcas.entrada = arrayMarcas[marca];
            }
            else if(arrayMarcas[marca].tipoMarca=="Salida"){
                marcas.salida = arrayMarcas[marca];
            }
            else if(arrayMarcas[marca].tipoMarca=="Salida al Almuerzo"){
                marcas.almuerzoOut = arrayMarcas[marca];
            }
            else if(arrayMarcas[marca].tipoMarca=="Entrada de Almuerzo"){
                marcas.almuerzoIn = arrayMarcas[marca];
            }
        }
        for(var i=0; i<arrayMarcas.length; i++){
            if(arrayMarcas[i].tipoMarca=="Salida a Receso"){
                marcas.recesos.push({recesoOut:arrayMarcas[i], recesoIn:null});
            }
            else if(arrayMarcas[i].tipoMarca=="Entrada de Receso"){
                marcas.recesos[marcas.recesos.length-1].recesoIn = arrayMarcas[i];
            }
        }
        for(var i=0; i<arrayMarcas.length; i++){
            if(arrayMarcas[i].tipoMarca=="Entrada a extras"){
                marcas.extras.push({extraIn:arrayMarcas[i], extraOut:null});
            }
            else if(arrayMarcas[i].tipoMarca=="Salida de extras"){
                marcas.extras[marcas.extras.length-1].extraOut = arrayMarcas[i];
            }
        }
        return marcas;
    },
    contarHoras: function (inicio, fin){
        if(inicio && fin){
            var hInicio = moment.unix(inicio.epoch);
            var hFin = moment.unix(fin.epoch);
            return this.ajustarHoras(
                {h:hFin.hours(),m:hFin.minutes()},
                {h:hInicio.hours(),m:hInicio.minutes()}
                );
        }else if(inicio){
            var hInicio = moment.unix(inicio.epoch);
            var hFin = moment();
            return this.ajustarHoras(
                {h:hFin.hours(),m:hFin.minutes()},
                {h:hInicio.hours(),m:hInicio.minutes()});
        }
        return {h:0, m:0};
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
        return total;
    },
    sumaHoras: function (hBase, mBase, hSuma, mSuma){
        var h = hBase;
        var m = mBase;
        if(mSuma+mBase>60){
            h = h+1;
            m = mSuma+mBase-60;
        }else{
            m=mSuma+mBase;
        }
        h = h + hSuma;
        return {h:h, m:m};
    },
    tiempoTotal : function(marcas){
        var tiempoT = this.contarHoras(marcas.entrada, marcas.salida);
        var tiempoAlmuerzo = this.contarHoras(marcas.almuerzoOut, marcas.almuerzoIn);
        tiempoT = this.ajustarHoras(tiempoT, tiempoAlmuerzo);
        for(receso in marcas.recesos){
            tiempoT = this.ajustarHoras(
                tiempoT, 
                this.contarHoras(
                    marcas.recesos[receso].recesoOut, 
                    marcas.recesos[receso].recesoIn)
                );
        }
        return tiempoT;
    },
    compararHoras : function (hIn, mIn, hOut, mOut){
        if(hIn==hOut && mIn==mOut) return 0;
        if(hIn==hOut && mIn>mOut) return 1;
        if(hIn>hOut) return 1;
        if(hIn==hOut && mIn<mOut) return -1;
        if(hIn<hOut) return -1;
    },
    horaStr: function (hora, minutos){
        var h = hora;
        var m = minutos;
        if(h<10) h = "0"+h;
        if(m<10) m = "0"+m;
        return h+":"+m;
    },
    getIdsList : function(list){
        return [[]].concat(list).reduce(
            function(result, item){
                return result.concat(item._id);
            });
    },



    //************************************************************************************************************
    //************************************************************************************************************
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

	    			if(evento[x].usuario!=null){
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
	    				} 
	    				else {
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
                        //console.log(evento[x]);
                        if("reportes" == query && evento[x].departamentos){
                            /*if(!evento[x].departamentos){
                                array.push(evento[x]);
                            }
                            else*/ if(JSON.stringify(evento[x].departamentos[0].departamento) === JSON.stringify(supervisor.departamentos[y].departamento) 
                             && notFound){
                             array.push(evento[x]);
			            		//
			            		notFound = false;
			            	} 
			            	else if(JSON.stringify(evento[x].tipo) === JSON.stringify("Supervisor") 
			            		&& notFound){
			            		array.push(evento[x]);
			            		//
			            		notFound = false;
			            	}
			            } else if (evento[x].departamentos) {
                            /*if(!evento[x].departamentos){
                                array.push(evento[x]);
                            }
                            else */if(JSON.stringify(evento[x].departamentos[0].departamento) === JSON.stringify(supervisor.departamentos[y].departamento) 
                             && JSON.stringify(evento[x]._id) != JSON.stringify(supervisor._id) && notFound){
                             array.push(evento[x]);
			            		//
			            		notFound = false;
			            	} 
			            	else if(JSON.stringify(evento[x].tipo) === JSON.stringify("Supervisor") 
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
    }

}