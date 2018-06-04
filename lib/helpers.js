 /*
 *Helpers for various tasks
 */

//Dependency
//For hashing
var crypto = require("crypto");
//For hashingSecret variable
var config = require('./config');

 //container for all helpers
 var helpers = {};

//hash method
//We use SHA-256 as it is built in in NODE
helpers.hash = function(str){
  if(typeof(str) == "string" && str.length>0){
    //hashing secret is contained in config.js
    var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
    return hash;
  }else{
    return false;
  }
};

//Parse a JSON string to an object in all cases, without throwing errors.
helpers.parseJsonToObject = function(str){
  try{
    var obj = JSON.parse(str);
    return obj;
  }catch(e){
    return {};
  }
};

//Export the modules
module.exports = helpers;
