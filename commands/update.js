const Command = require('../cmdModule/commands').Command
const _api = require('../api')

class UpdateCommand extends Command {
  constructor() {
    super({
      name: 'update',
      help: 'Updates the bot'
    })
  }
  hasPermission(message, api) {
      if(api.isRank(message.author, 'botAdmin')) return true
      return false
  }
  async run(message, args, api) {
    bot.destroy().then(() => {
      require('child_process').exec('cd ~/cyclone/source && git pull', (err, stdout, stderr) => {
        if(err){
          return require('child_process').exec('pm2 restart Cyclone')
        }
        require('child_process').exec('pm2 restart Cyclone')
      })
    })
  }
}

module.exports = UpdateCommand