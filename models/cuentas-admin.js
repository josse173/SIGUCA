var mongoose = require('mongoose');
/** Leer la configuración de ./config/config **/
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config')[env];
//Para conectarse a la base de datos indicada en config.db
//To connect with the database on config.db
mongoose.connect(config.db);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error de conexión:'));
db.once('open', function callback () {
  console.log('Conexión a Mongo abierta');
});

var accounts = db.collection('accounts');

/* login validation methods */

exports.autoLogin = function(user, pass, callback)
{
	accounts.findOne({user:user}, function(e, o) {
		if (o){
			o.pass == pass ? callback(o) : callback(null);
		}	else{
			callback(null);
		}
	});
}
