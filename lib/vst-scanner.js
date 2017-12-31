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
    results[id] = Object.assign(item, reader(item.path))
  })

  return Promise.all(newResults)
    .then(function () {
      return newResults
    })
}

module.exports = function (dirs, type, read) {
  read = read || false
  var vstFiles = []
  var allowed = getAllowedExtensions(type)

  return Promise.each(dirs, function (directory) {
    return dir.promiseFiles(directory)
      .then(function (files) {
        var filtered = files.filter(function (file) {
          var keep = false
          allowed.forEach(function (extension) {
            if (file.substr(-extension.length) === extension) {
              keep = true
            }
          })
          return keep
        })

        vstFiles = vstFiles.concat(filtered)
        return filtered
      })
  })
    .then(function () {
      var results = {};

      return Promise.each(vstFiles, function (file) {
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
        .then(function () {
          if (read) {
            return readItems(results)
          } else {
            return results
          }
        })
    })
}
