const Command = require('../cmdModule/commands').Command
const Discord = require('discord.js')
const _api = require('../api')
const os = require('os')

class AboutCommand extends Command {
  constructor() {
    super({
      name: 'about',
      help: 'About the bot and its environment'
    })
  }

  async run(message, args, api) {
    let embed = new Discord.RichEmbed()
    embed.setTitle('About')
    embed.setColor('#FF851B')
    embed.addField('Version', require('../package.json').version, true)
    embed.addField('Platform', os.platform(), true)
    await message.channel.sendEmbed(embed)
    return true
  }
}

module.exports = AboutCommand