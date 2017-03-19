const Command = require('../cmdModule/commands').Command

class PurgeCommand extends Command {
  constructor() {
    super({
      name: 'purge',
      help: 'Purges x number of messages in current channel.'
    })
  }
  
  hasPermission(message) {
    if(message.channel.permissionsFor(message.author).serialize()["MANAGE_MESSAGES"]) return true
    return false  
  }

  async run(message, args, api) {
    let limit = args[1] || 15
    limit = parseInt(limit)
    message.channel.fetchMessages({limit: limit})
      .then((messages) => message.channel.bulkDelete(messages))
    message.channel.sendMessage(`Successfully purged ${limit.toString()} message(s). This message will be deleted in 5 seconds.`)
      .then((msg) => msg.delete(5000))
    return true
  }
}

module.exports = PurgeCommand