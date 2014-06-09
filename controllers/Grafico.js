var mongo = require('mongoose'),
Server = mongo.Server,
Db = mongo.Db;
var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('sigucadb', server);
 
var onErr = function(err,callback){
	 db.close();
	 callback(err);
};
	 
exports.teamlist = function(epoc,callback){
	db.open(function(err, db) {
		if(!err) {
			db.collection('marcas', function(err, collection) {
				if(!err){
					collection.find({'marcas':epoc}).toArray(function(err, docs) {
						if(!err){
							db.close();
							var intCount = docs.length;
							if(intCount > 0){
								var strJson = "";
								for(var i=0; i<intCount;){
									strJson += '{"country":"' + docs[i].country + '"}'
									i=i+1;
								if(i<intCount){
									strJson+=',';
								}
								}
								strJson = '{"GroupName":"'+gname+'","count":'+intCount+',"teams":[' + strJson + "]}"
								callback("",JSON.parse(strJson));
							}
						}
						else{onErr(err,callback);}
					});//end collection.find
				}
				else{onErr(err,callback);}
			});//end db.collection
		}
		else{onErr(err,callback);}
	});// end db.open
};