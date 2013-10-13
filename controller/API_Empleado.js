/* 
El contEmpleadoador API del Empleado
Exporta 3 métodos:
* post - Crea nuevo Empleado.
* list - Retorna una lista de Empleado
* show - Displays a thread and its posts
*/

var Empleado = require('../models/Empleado.js');

exports.post = function(req, res) {
new Empleado({Empleado: req.body.Empleado, nombre: req.body.nombre}).save();
}