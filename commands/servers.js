const Command = require('../cmdModule/commands').Command
const Discord = require('discord.js')

class ServersCommand extends Command {
  constructor() {
    super({
      name: 'servers',
      help: 'Returns all the servers the bot is in'
    })
  }
  hasPermission(message, api) {
    if(api.isRank(message.author, 'botStaff')) return true
    return false
  }
  async run(message, args, api) {
    let guilds = message.client.guilds.array()
    let embed = new Discord.RichEmbed()
    embed.setTitle('Servers')
    embed.setColor('#FF851B')
    for(let _guild in guilds){
      if(!guilds.hasOwnProperty(_guild)) continue
      let guild = guilds[_guild]
      embed.addField(guild.name, guild.id, true)
    }
    await message.channel.sendEmbed(embed)
    return true
  }
}

module.exports = ServersCommand