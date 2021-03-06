const path = require('path');
const osjs = require('osjs-build');

module.exports = new Promise((resolve, reject) => {
  const metadataFile = path.join(__dirname, 'metadata.json');

  osjs.webpack.createPackageConfiguration(metadataFile).then((result) => {
  	result.config.target = "node";
    resolve(result.config);
  }).catch(reject);
});
