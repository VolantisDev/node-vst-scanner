var Promise = require('bluebird')
var dir = require('node-dir')
var path = require('path')
var vst2 = require('./vst2-file')
var vst3 = require('./vst3-file')
var reader = require('./vst-reader')

function getAllowedExtensions(type) {
  var allowed = []
  if (!type || type === 'vst2') {
    allowed.push(vst2.extension)
  }
  if (!type || type === 'vst3') {
    allowed.push(vst3.extension)
  }

  return allowed;
}

function readItems(results) {
  var newResults = {}
  Object.keys(results).forEach(function (id) {
    var item = results[id]
    newResults[id] = reader(item.path)
      .then(function (itemData) {
        return Object.assign(item, itemData)
      })
  })

  return Promise.props(newResults)
}

module.exports = function (dirs, type, read) {
  read = read || false
  var vstFiles = []
  var allowed = getAllowedExtensions(type)

  return Promise.each(dirs, function (directory) {
    return dir.promiseFiles(directory)
      .then(function (files) {
        var filtered = files.filter(function (file) {
          var extension = path.extname(file)
          return allowed.includes(extension)
        })

        vstFiles = vstFiles.concat(filtered)
        return vstFiles
      })
  })
    .then(function () {
      var results = {};

      vstFiles.forEach(function (file) {
        var extension = path.extname(file)
        var filename = path.basename(file)

        results[filename] = {
          title: path.basename(file, extension),
          filename: filename,
          extension: extension,
          path: file,
          type: (extension === '.vst3') ? 'vst3' : 'vst2'
        }
      })

      if (read) {
        return readItems(results)
      } else {
        return results
      }
    })
}
