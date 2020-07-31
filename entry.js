require("@babel/register")({
  presets: ["@babel/preset-env"]
});

console.log(process.argv[2]);

// Import the rest of our application.
module.exports = require('./' + process.argv[2]);
