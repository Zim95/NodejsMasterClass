//Dependency

//Data storage handler
var _data = require("./data");
//Helper module
var helpers = require("./helpers");

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

//container for user submethods
handlers._users = {};

//Users-POST
//Required data: fname, lname, phone, password, tosAgreement
//Optional data: None
handlers._users.post = function(data,callback){
  //Check that all required fields are filled out
  var firstName = typeof(data.payload.firstName) == "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim(): false;
  var lastName = typeof(data.payload.lastName) == "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim(): false;
  var phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 10 ? data.payload.phone.trim(): false;
  var password = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim(): false;
  var tosAgreement = data.payload.tosAgreement == true ? true: false;


  if(firstName && lastName && phone && password && tosAgreement){
    //Make sure that the user doesn't already exist.
    _data.read('users',phone,function(err,data){
      //error means you cannot read the particular user
      if(err){
        //Create the user:-
        //Hash the password
        var hashedPassword = helpers.hash(password);

        if(hashedPassword){
          //create the user object
          var userObject = {
            'firstName':firstName,
            'lastName':lastName,
            'phone':phone,
            'password':hashedPassword,
            'tosAgreement':true,//should be tosAgreement but let's see where it goes
          };

          //create the user
          _data.create('users',phone,userObject,function(err){
            if(!err){
              callback(200);
            }else{
              console.log(err);
              callback(500,{'Error':'Could not create new user'});
            }
          });
        }else{
          callback(500,{"Error":"Could not hash the user\'s password"});
        }

      }else{
        //User already exists
        callback(400,{"Error":"A user with that phone number already exists"});
      }
    });

  }else{
    callback(400,{'Error':'Missing required fields','data':data});
  }
};

//Users-GET
//Required data: phone
//Optional data: none
//TODO: Only let authenticated users access their object
handlers._users.get = function(data,callback){
  //check that the phone number is valid
  //Since this is a get request, there is no payload.
  //Therefore, we will pull the phone number from the query string object.
  var phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 10?data.queryStringObject.phone.trim():false;

  if(phone){
    //Lookup the user
    _data.read('users',phone,function(err,data){
      if(!err && data){
        //Remove the hashed password from the user object before returning it to the requester
        delete data.hashedPassword;
        callback(200,data);
      }else{
        callback(404,{'Error':'Valid phone number pattern. However, number is not found in the database.'});
      }
    });
  }else{
    callback(400,{'Error':'Invalid phone number.'});
  }
};

//Users-DELETE
//Required field: phone
//TODO: Only let an authenticated user delete their object. Do not let them delete anyone else's.
//TODO: Cleanup (delete) any other data files, associated with the user.
handlers._users.delete = function(data,callback){
  //check that the phone number is valid
  //Since this is a get request, there is no payload.
  //Therefore, we will pull the phone number from the query string object.
  var phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 10?data.queryStringObject.phone.trim():false;

  if(phone){
    //Lookup the user
    _data.read('users',phone,function(err,data){
      if(!err && data){
        _data.delete('users',phone,function(err){
          if(!err){
            callback(200);
          }else{
            callback(500,{'Error':'Could not delete the specified user.'});
          }
        });
      }else{
        callback(400,{'Error':'Could not find the specified user.'});
      }
    });
  }else{
    callback(400,{'Error':'Invalid phone number.'});
  }

};

//Users-PUT
//Required data: phone
//Optional data: fname,lname and password (at least one must be specified).
//TODO:Only let an authenticated usser update their own object, not anyone elses.
handlers._users.put = function(data,callback){
  //Check for the required field.
  var phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 10?data.payload.phone.trim():false;

  //Check for optional fields
  var firstName = typeof(data.payload.firstName) == "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim(): false;
  var lastName = typeof(data.payload.lastName) == "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim(): false;
  var password = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim(): false;

  //Error if phone is invalid
  if(phone){
    //Error if nothing is sent to update.
    if(firstName || lastName || password){
      //Lookup the user.
      _data.read('users',phone,function(err,userData){
        if(!err && userData){
          //Update the necessary fields.
          if(firstName){
            userData.firstName = firstName;
          }
          if(lastName){
            userData.lastName = lastName;
          }
          if(password){
            userData.password = helpers.hash(password);
          }

          console.log(userData);
          //store the new updates
          _data.update('users',phone,userData,function(err){
            if(!err){
              callback(200);
            }else{
              console.log(err);
              callback(500,{'Error':'Could not update the user.'});
            }
          });
        }else{
          callback(400,{'Error':'The specified user does not exist.'});
        }
      });
    }else{
      callback(400,{'Error':'Missing fields to update.'});
    }
  }else{
    callback(400,{'Error':'Missing a required field. You must provide a phone number for update.'});
  }
};

//Exporting the module
module.exports = handlers;
