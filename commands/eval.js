const Command = require('../cmdModule/commands').Command
const _api = require('../api')

class EvalCommand extends Command {
  constructor() {
    super({
      name: 'eval',
      help: 'Evaluate code on the bot'
    })
  }
  hasPermission(message, api) {
      if(api.getRank(message.author) == 'botAdmin') return true
      return false
  }
  async run(message, args, api) {
    try{
      let code = message.content.substr(5);
      let resp = eval(code);
      api.success('Your code successfully ran on the bot!')
      msg.channel.sendMessage(`\`\`\`${resp}\`\`\``);
    }catch(ex){
      api.error('Your code failed to run on the bot. Stack trace is below.')
      msg.channel.sendMessage(`\`\`\`${ex}\`\`\``);
    }
  }
}

module.exports = EvalCommand