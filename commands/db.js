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
  let userCommand = dbCommand.registerSubcommand('user', sr`cy!database user [set/add/subtract/on/off]`, {
    requirements: {
      userIDs: ['116693403147698181']
    },
    description: 'Manage a user in the Cyclone database',
    fullDescription: 'Manage a user in the Cyclone database'
  })
  userCommand.registerSubcommand('set', (msg, args) => {
    let user = msg.mentions[0] || args[0]
    if(!user) {
      return `mention a user pls`
    }
    let id = args[0]
    if(msg.mentions[0]) id = user.id
    db.setUserOption(id, args[1], args[2])
  }, {
    requirements: {
      userIDs: ['116693403147698181']
    },
    description: 'Manage a user in the Cyclone database',
    fullDescription: 'Manage a user in the Cyclone database'
  })


  let serverCommand = dbCommand.registerSubcommand('server',sr`cy!database server [set/add/subtract/on/off]`, {
    requirements: {
      userIDs: ['116693403147698181']
    },
    description: 'Manage a server in the Cyclone database',
    fullDescription: 'Manage a server in the Cyclone database'
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