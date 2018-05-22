/*
  *Create and export all configuration variables
  */

//container for all the environments
var environments = {};

//Staging (default) environments
environments.staging = {
  'httpPort':3000,
  'httpsPort':3001,
  'envName': 'staging'
};

//production environment
environments.production = {
  'httpPort':5000,
  'httpsPort':5001,
  'envName':'production'
};

//determine which environment was passed on as the command line arguement
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string'?process.env.NODE_ENV.toLowerCase():'';

//Check that the environment is one of the above, else default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object'? environments[currentEnvironment]:environments.staging;

//export module
module.exports = environmentToExport;
