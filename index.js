//require('babel-register');
//require('babel-polyfill');

require("@babel/register")({
  presets: ["@babel/preset-env"]
});

console.log(process.argv[2]);

// Import the rest of our application.
module.exports = require('./src/' + process.argv[2] + '.js');
