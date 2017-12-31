const vstScanner = require('./lib/vst-scanner')

var dirs = [
  'E:\\Music\\VST Plugins'
]

vstScanner(dirs, false, true)
  .then(function (results) {
    console.log(results)
  })
