/** SIGUCA 
 *
 *		Opciones de Configuración 
**/

/** definir el directorio base **/
var path = require('path'),
	rootPath = path.normalize(__dirname + '/..');

module.exports = {
	'development': {
		db: 'mongodb://localhost/sigucadb',
		root: rootPath,
		app: {
			name: 'SIGUCA Ambiente de Desarollo'
		}
	},
	'production': {
		db: 'mongodb://localhost/sigucaD',
		root: rootPath,
		app: {
			name: 'SIGUCA'
		}
	}
}
