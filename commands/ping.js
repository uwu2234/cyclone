const Command = require('../cmdModule/commands').Command


class PingCommand extends Command {
  constructor() {
    super({
      name: 'ping',
      help: 'Returns the current ping in milliseconds.'
    })
  }

  async run(message, args, api) {
    api.success(`Ping: ${message.client.ping.toString()} ms`)
    return true
  }
}

module.exports = PingCommand