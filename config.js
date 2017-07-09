let config = require('./config.json')
if(process.env.NODE_ENV === 'dev') config = require('./config.dev.json')
module.exports = config