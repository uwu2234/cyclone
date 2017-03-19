const Command = require('../cmdModule/commands').Command


class ReloadCommand extends Command {
  constructor() {
    super({
      name: 'reload',
      help: 'Reload a command'
    })
  }

  hasPermission(message) {
    if(message.author.id === '116693403147698181') return true
    return false
  }

  async run(message, args, api) {
    try {
      api.handler.reloadCommand(args[1])
      api.success(`Successfully reloaded command ${args[1]}!`)
    } catch(err) {
      api.error(`Failed to reload command ${args[1]}.\n${err.toString()}`)
      return false
    }
    return true
  }
}

module.exports = ReloadCommand