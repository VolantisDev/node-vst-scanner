var Promise = require('bluebird')
var dir = require('node-dir')
var path = require('path')
var vst2 = require('./vst2-file')
var vst3 = require('./vst3-file')

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

module.exports = function (dirs, type) {
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
        var extension = file.substr(-4)
        var filename = path.basename(file)

        results[filename] = {
          title: path.basename(file, extension),
          filename: filename,
          extension: extension,
          path: file
        }
      })
        .then(function () {
          return results
        })
    })
}
