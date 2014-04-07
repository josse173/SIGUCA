angular.module('empleadoManager', []);


function ListController($scope, $http) {
  $scope.headers = ["cedula", "name", "apellido", "departamento"];
  $http({method: 'jsonp', url: 'http://host:3000/configuracion?callback=JSON_CALLBACK'}).success(function(data, status, headers, config) {
    $scope.empleados = data;
  }).
  error(function(data, status, headers, config) {
    //handle error
  });
}
var empleados = document.getElementById('empleados');
var tipHorarios = document.getElementById('tipHorarios');
var areas = document.getElementById('areas');
var roles = document.getElementById('roles');



function changeElemt(elemento){	
	document.getElementById("pressElmnt").innerHTML =  elemento ;
}
function addElmnt(elemento){
	//if elemento is empleado
	//despliega modal de empleado

}	
