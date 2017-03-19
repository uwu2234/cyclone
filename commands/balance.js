const Command = require('../cmdModule/commands').Command
const _api = require('../api')

class BalanceCommand extends Command {
  constructor() {
    super({
      name: 'balance',
      help: 'Check the balance of yourself or a user.'
    })
  }

  async run(message, args, api) {
    if(typeof args[1] === 'string'){
      let target = args[1].replace('<@', '').replace('>', '')
      _api.getBalance(target, (err, balance) => {
        if(err){
          return api.error('Failed to get target\'s balance! Please try again later.')
        }
        api.success(`${bot.users.get(target).username}'s balance is **${balance}**!`)
      })
    }else{
      _api.getBalance(msg.author.id, (err, balance) => {
        if(err){
          return api.error('Failed to get your balance! Please try again later.')
        }
        api.success(`Your balance is **${balance}**!`)
      })
    }
  }
}

module.exports = BalanceCommand