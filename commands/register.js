const Command = require('../cmdModule/commands').Command


class RegisterCommand extends Command {
  constructor() {
    super({
      name: 'register',
      help: 'Registers a command.'
    })
  }
  hasPermission(message) {
    if(message.author.id === '116693403147698181') return true
    return false  
  }
  async run(message, args, api) {
    try {
      api.handler.registerCommand(args[1])
      api.success(`Successfully registered command ${args[1]}!`)
    } catch(err) {
      api.error(`Failed to register command ${args[1]}.\n${err.toString()}`)
      return false
    }
    return true
  }
}

module.exports = RegisterCommand