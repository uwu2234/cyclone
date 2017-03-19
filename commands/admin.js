const Command = require('../cmdModule/commands').Command


class AdminCommand extends Command {
  constructor() {
    super({
      name: 'admin',
      help: 'Sends the link to authenticate to the admin panel.'
    })
  }

  async run(message, args, api) {
    message.channel.sendMessage('http://cyclonebot.com/auth')
    return true
  }
}

module.exports = AdminCommand