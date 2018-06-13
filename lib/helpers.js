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

//Create a string of random alphanumeric characters of random length
helpers.createRandomString = function(strLength){
    strLength = typeof(strLength) == 'number' && strLength>0? strLength:false;
    if(strLength){
      //Define all the possible characters that could go into a string
      var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
      //Start the final string
      var str = '';

      for(var i=1; i<=strLength; i++){
        //Get a random character from a possible character string
        var randomChar = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        //Append this character to the final string
        str+=randomChar;
      }
      //return the final string
      return str;
    }else{
      return false;
    }
};

//Export the modules
module.exports = helpers;
