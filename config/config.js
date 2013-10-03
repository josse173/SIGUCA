/** SIGUCA opciones de configuración **/

/** definir el directorio base **/
var path = require('path'),
	rootPath = path.normalize(__dirname + '/..');

module.exports = {
	'development': {
		db: 'mongodb://localhost/sigucaDB_dev',
		root: 'rootPath',
		app: {
			name: 'SIGUCA ambiente desarollo'
		}
	},
	'production': {
		db: 'mongodb://localhost/sigucaDB',
		root: 'rootPath',
		app: {
			name: 'SIGUCA'
		}
	}
}