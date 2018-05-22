/*
*Primary file for the API
*
*/

//Dependencies
//for http server
var http = require("http");
//for https server
var https = require("https");
//for getting url parameters, qyerystrings, path etc.
var url = require("url");
//for decoding streams
var StringDecoder = require("string_decoder").StringDecoder;
//import configurations
var config = require('./config');
//for importing https certificates
var fs = require("fs");

//Instantiating the HTTP server
var httpServer = http.createServer(function(req,res){
  //just pass its req and res to the unified server
  unifiedServer(req,res);
});

//start the HTTP server and have it listen to port specified as per config.js
httpServer.listen(config.httpPort,function(){
  console.log("Server is listening at port " + config.httpPort+" in "+config.envName+" mode" );
});

//Instantiating the HTTPS server
var httpsServerOptions = {
  'key':fs.readFileSync(),
  'cert':fs.readFileSync()
};
var httpsServer = https.createServer(httpsServerOptions,function(req,res){
  //just pass its req and res to the unified server
  unifiedServer(req,res);
});

//start the HTTPS server and have it listen to port specified as per config.js
httpsServer.listen(config.httpsPort,function(){
  console.log("Server is listening at port " + config.httpPort+" in "+config.envName+" mode" );
});


//All the server logic for both http and https server
var unifiedServer = function(req,res){
  //Get the URL and parse it
  var parsedUrl = url.parse(req.url,true);

  //Get the path
  var path = parsedUrl.pathname;
  //The regex means remove one or more instances of '/' from the beginning i.e /^\/+ or from the end i.e \/+$ so this results in /^\/+|\/+$/
  var trimmedPath = path.replace(/^\/+|\/+$/g,'');

  //Get the query string
  var queryStringObject = parsedUrl.query;

  //Get the http method
  var method = req.method.toLowerCase();

  //headers
  var headers = req.headers;

  //Get the payload, if any
  //Payload: The body in a POST/PUT request, use POSTMAN
  //We need string decode for this
  var decoder = new StringDecoder('utf-8');
  //create en empty buffer to hold the payload
  var buffer = '';
  //when the req object fires an event called data, which fires when streams are recieved,then add that to the buffer
  //this method will only be called if there is a payload
  req.on('data',function(data){
    //append to buffer
    buffer += decoder.write(data);
  });
  //this method will always be called .i.e even if there is no payload
  req.on('end',function(){
    //end the buffer
    buffer += decoder.end();

    //Choose the handler this request should go to
    //If not found use the not found handler
    var chosenHandler = typeof(router[trimmedPath]) != 'undefined'? router[trimmedPath]:handlers.notFound;

    //construct data to send
    var data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method':method,
      'headers':headers,
      'payload':buffer
    };

    //now chosen handler holds handler.sample or handler.notFound or etc....
    //now we call chosen handler and pass it the data variable and the function to which it calls back with or without arguements
    chosenHandler(data,function(statusCode,payload){
      //this is the definition of the function that we will pass

      //these are the callback values
      //use the data defined by the handler or use default status statusCode, if arugment exists in callback
      statusCode = typeof(statusCode) == "number"?statusCode:200;
      //use the payload defined by the handler or default to an empty object, if arguement exists in callback
      payload = typeof(payload) == "object"?payload:{};

      //convert to string
      var payloadString = JSON.stringify(payload);

      //returning the application type:should be called before writeHead
      res.setHeader('Content-Type','application/json');
      //return the response
      res.writeHead(statusCode);
      //Send the repsonse payload
      res.end(payloadString);

      //Log the request pate
      console.log("The untrimed path specified by the user is:" + path);
      console.log("The path specified by the user is: " + trimmedPath);
      console.log("The method used is: " + method);
      console.log("The query string is: " + JSON.stringify(queryStringObject));
      console.log("The headers are: " + JSON.stringify(headers));
      console.log("The payload is: " + buffer);
      console.log("Returning the response",statusCode,payloadString);
    });

  });

};
//Define handlers
var handlers = {};
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
//Define a request router
var router = {
  '':handlers.sample,
  'sample': handlers.sample
};
