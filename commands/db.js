const sr = require('common-tags').stripIndents
const RichEmbed = require('../embed')
const path = require('path')
module.exports = function (bot, db, log) {
  const requirements = {
    requirements: {
      userIDs: ['116693403147698181']
    }
  }
  let dbCommand = bot.registerCommand('database', sr`cy!database [raw|server|user]`, {
    requirements: {
      userIDs: ['116693403147698181']
    },
    aliases: ['db'],
    description: 'Manage the Cyclone database',
    fullDescription: 'Manage the Cyclone database'
  })
  dbCommand.registerSubcommand('server', (msg, args) => {

  }, {
    requirements: {
      userIDs: ['116693403147698181']
    },
    description: 'View the Cyclone database',
    fullDescription: 'View the Cyclone database'
  })
  dbCommand.registerSubcommand('raw', (msg, args) => {
    let _db = db.raw()
    return '```' + JSON.stringify(_db, null, 2) + '```'
  }, {
    requirements: {
      userIDs: ['116693403147698181']
    },
    description: 'View the Cyclone database',
    fullDescription: 'View the Cyclone database'
  })
  log.info('Database commands registered')
}