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