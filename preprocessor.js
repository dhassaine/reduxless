const babelJest = require('babel-jest');
module.exports = babelJest.createTransformer({
  "presets": [
    ["env", {
      "targets": {
        "browsers": ["last 2 versions", "safari >= 7"]
      }
    }], 
    "react", 
    "stage-0"
  ]
});
