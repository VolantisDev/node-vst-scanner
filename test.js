const Promise = require('bluebird')
const vstScanner = require('./lib/vst-scanner')
const vstReader = require('./lib/vst-reader')

var dirs = [
  'E:\\Music\\VST Plugins'
]

vstScanner(dirs, 'vst3')
  .then(function (results) {

    var vsts = {}
    Object.keys(results).forEach(function (key) {
      vsts[key] = vstReader(results[key].path)
    })

    return Promise.props(vsts)
      .then(function (vsts) {
        console.log(vsts)
      })
  })
