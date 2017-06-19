const sr = require('common-tags').stripIndents
const RichEmbed = require('../embed')
module.exports = function (bot, db, log) {  
  const colorcfg = {
    green: '#139A43',
    red: '#DA2C38',
    blue: '#256EFF',
    purple: '#5E239D',
    green2: '#0DAB76'
  }
  bot.registerCommand('ping', '🏓 Pong!', {
    description: 'Pong',
    fullDescription: 'Pong!'
  })
  bot.registerCommand('info', (msg, args) => {
    let embed = new RichEmbed()
    embed.setAuthor(bot.user.username, bot.user.avatarURL, 'https://cyclonebot.com')
    embed.addField('Version', require('../package.json').version, true)
    embed.addField('Owner', '<@116693403147698181>', true)
    embed.addField('Guilds', bot.guilds.size, true)
    embed.addField('Users', bot.users.size, true)
    embed.setTimestamp()
    msg.channel.createMessage({ embed: embed.toJSON() })
  }, { 
    description: 'Information',
    fullDescription: 'Information about the bot.'
  })
  log.info('Misc commands registered')
}