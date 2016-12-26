const Command = require('../cmdModule/commands').Command


class LoadCommand extends Command {
  constructor() {
    super({
      name: 'load',
      help: 'Load a command'
    })
  }

  hasPermission(message) {
    if(message.author.id === '116693403147698181') return true
    return false
  }

  async run(message, args, api) {
    try {
      api.handler.loadCommand(args[1])
      api.success(`Successfully loaded command ${args[1]}!`)
    } catch(err) {
      api.error(`Failed to load command ${args[1]}.\n${err.toString()}`)
      return false
    }
    return true
  }
}

module.exports = LoadCommand