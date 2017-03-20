const Command = require('../cmdModule/commands').Command
const _api = require('../api')

class ShutdownCommand extends Command {
  constructor() {
    super({
      name: 'shutdown',
      help: 'Shutsdown the bot'
    })
  }
  hasPermission(message, api) {
      if(api.isRank(message.author, 'botAdmin')) return true
      return false
  }
  async run(message, args, api) {
    bot.destroy().then(() => {
      require('child_process').exec('pm2 stop Cyclone')
    })
  }
}

module.exports = ShutdownCommand