const Command = require('../cmdModule/commands').Command
const Discord = require('discord.js')

class HelpCommand extends Command {
  constructor() {
    super({
      name: 'help',
      help: 'Shows help for commands'
    })
  }

  async run(message, args, api) {
    let embed = new Discord.RichEmbed()
    embed.setTitle('Help')
    embed.setColor('#B10DC9')
    embed.setTimestamp(new Date())
    let text = `Cyclone ${require(require('path').join(__dirname, '..', 'package.json')).version}\n`
    text += `To pass arguments that are more than one word, surround the argument in quotation marks. ex:\n`
    text += `${api.handler.prefix}example "this is all one argument" these are seperate\n`
    text += `For more help, message <@116693403147698181>`
    for(let _cmd in api.handler.commands) {
      if(!api.handler.commands.hasOwnProperty(_cmd)) continue
      let cmd = api.handler.commands[_cmd]
      if(!cmd.hasPermission(message, api)) continue
      text += `\n${api.handler.prefix}${cmd.name} » ${cmd.help}`      
    }
    embed.setDescription(text)
    message.channel.sendEmbed(embed)
    return true
  }
}

module.exports = HelpCommand