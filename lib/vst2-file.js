const Promise = require('bluebird')
var readFile = Promise.promisify(require('fs').readFile)
var stat = Promise.promisify(require('fs').stat)
const path = require('path')

/**
 *
 * @param buffer
 * @param str
 * @returns {number}
 */
function bufferIndexOf(buffer, str) {
  if (typeof str !== 'string' || str.length === 0 || str.length > buffer.length) {
    return -1
  }

  var search = str.split("").map(function(el) { return el.charCodeAt(0) })
  var searchLen = search.length
  var ret = -1
  var i
  var j
  var len

  for (i = 0, len = buffer.length; i < len; ++i) {
    if (buffer[i] == search[0] && (len-i) >= searchLen) {
      if (searchLen > 1) {
        for (j=1; j<searchLen; ++j) {
          if (buffer[i+j] != search[j])
            break
          else if (j == searchLen-1) {
            ret = i
            break
          }
        }
      } else
        ret = i
      if (ret > -1)
        break
    }
  }
  return ret
}

function getArchInformation(contents) {
  var index = bufferIndexOf(contents, 'PE')
  var archIdentifier = contents[index + 4].toString(16).toLowerCase()
  switch (archIdentifier) {
    case "4c":
      return '32-bit'
    case '64':
      return '64-bit'
  }
  return "unknown"
}

function readVst(file) {
  var ext = path.extname(file)
  var filename = path.basename(file)
  var name = path.basename(file, ext)
  var info = {
    id: name,
    name: name,
    filename: filename,
    extension: '.dll',
    path: file,
    type: 'vst2',
    size: 'unknown',
    arch: 'unknown'
  }

  return stat(file)
    .then(function (stats) {
      info.size = stats['size']
      return readFile(file)
    })
    .then(function (result) {
      info.arch = getArchInformation(result)
      return info
    })
}

module.exports = {
  type: 'vst2',
  extension: '.dll',
  read: readVst
}
