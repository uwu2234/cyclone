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
      if(message.author.id === '116693403147698181') return true
      return false
  }
  async run(message, args, api) {
    try{
      let code = message.content.substr(5);
      global.eapi = api;
      let resp = eval(code);
      global.eapi = undefined;
      api.success('Your code successfully ran on the bot!')
      message.channel.sendMessage(`\`\`\`${resp}\`\`\``);
    }catch(ex){
      api.error('Your code failed to run on the bot. Stack trace is below.')
      message.channel.sendMessage(`\`\`\`${ex}\`\`\``);
    }
  }
}

module.exports = EvalCommand