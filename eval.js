let child_process = require('child_process')
const path = require('path')
module.exports = function(filename) {
  var child = child_process.fork(path.join(__dirname, 'eval', 'filename.js'))
  setTimeout(function() {
    child.kill()
  }, 10000)
}