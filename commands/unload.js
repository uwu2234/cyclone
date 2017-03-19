const Command = require('../cmdModule/commands').Command


class UnloadCommand extends Command {
  constructor() {
    super({
      name: 'unload',
      help: 'Unload a command'
    })
  }

  hasPermission(message) {
    if(message.author.id === '116693403147698181') return true
    return false
  }

  async run(message, args, api) {
    try {
      api.handler.unloadCommand(args[1])
      api.success(`Successfully unloaded command ${args[1]}!`)
    } catch(err) {
      api.error(`Failed to unload command ${args[1]}.\n${err.toString()}`)
      return false
    }
    return true
  }
}

module.exports = UnloadCommand