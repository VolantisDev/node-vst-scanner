const path = require('path')

module.exports = function readVst(file) {
  var extension = path.extname(file)
  var vst = (extension === '.vst3') ? require('./vst3-file') : require('./vst2-file');
  return vst.read(file)
}
