const Command = require('../cmdModule/commands').Command
const _api = require('../api')

class SetBalanceCommand extends Command {
  constructor() {
    super({
      name: 'setbalance',
      help: 'Set the balance of a user'
    })
  }
  hasPermission(message, api) {
      console.log(message.author)
      if(api.getRank(message.author) == 'botMod' || api.getRank(message.author) == 'botAdmin') return true
      return false
  }
  async run(message, args, api) {
    let target = args[1].replace('<@', '').replace('>', '')
    let balance = parseInt(args[2])
    _api.setBalance(target, balance, (err) => {
      if(err){
        return apx.error('Failed to set target\'s balance! Please try again later.')
      }
      api.success(`Their balance is now set to **${balance}**!`)
    })
  }
}

module.exports = SetBalanceCommand