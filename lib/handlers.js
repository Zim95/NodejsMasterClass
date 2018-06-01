//Define handlers
var handlers = {};
//ping handler
handlers.ping = function(data,callback){
  callback(200);
};
//sample handler
handlers.sample = function(data,callback){
  //Callback an http status code and a payload object
  callback(406,{"name":"sample handler"});
};
//notFound handler
handlers.notFound = function(data,callback){
  //callback an http status code and a payload object
  callback(404);
};

handlers.users = function(data,callback){
  //set allowed methods
  var acceptableMethods = ['post','get','delete','put'];
  //if data.method is found in acceptableMethods then
  if(acceptableMethods.indexOf(data.method)>-1){
    //call handlers._users[key] methodd with data and callback. 
    handlers._users[data.method](data,callback);
  }else{
    callback(405);
  }
}

module.exports = handlers;
