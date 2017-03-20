const Command = require('../cmdModule/commands').Command
const _api = require('../api')

class RestartCommand extends Command {
  constructor() {
    super({
      name: 'restart',
      help: 'Restarts the bot'
    })
  }
  hasPermission(message, api) {
      if(api.isRank(message.author, 'botMod')) return true
      return false
  }
  async run(message, args, api) {
    bot.destroy().then(() => {
      require('child_process').exec('pm2 restart Cyclone')
    })
  }
}

module.exports = RestartCommand