const config = require('./config.json')
if(config.env && config.env == 'dev') config = require('./config.dev.json')
config.environ = config.env || 'production'
module.exports = config