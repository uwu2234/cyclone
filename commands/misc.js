const sr = require('common-tags').stripIndents
const RichEmbed = require('../embed')
const moment = require('moment')
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
  bot.registerCommand('shards', (msg, args) => {
    let shards = `  ID    Ping    Guilds`
    let shardGuildCt = {}
    for(let k in bot.guildShardMap) {
      if(!bot.guildShardMap.hasOwnProperty(k)) continue
      let v = bot.guildShardMap[k]
      shardGuildCt[v] = (shardGuildCt[v] + 1) || 1
    }
    bot.shards.forEach((shard) => {
      if(msg.channel.guild && msg.channel.guild.shard.id == shard.id) {
        shards += `\n* ${shard.id}    ${shard.latency}    ${shardGuildCt[shard.id]}`
      } else {
        shards += `\n  ${shard.id}    ${shard.latency}    ${shardGuildCt[shard.id]}`
      }
    })
    return '```' + shards + '```'
  }, {
    description: 'View the shards of Cyclone',
    fullDescription: 'View the shards of Cyclone'
  })
  bot.registerCommand('title', (msg, args) => {
    if(typeof args == 'undefined' || args[0] == null) {
      let title = db.getUserOption(msg.author.id, 'title')
      if(typeof title ==  'undefined') {
        return sr`You do not have a title.
        To set one, run the command \`cy!title this is my title\``
      }
      return sr`Your title is \`\`\`${title}\`\`\``
    } else {
      let title = args.join(' ')
      db.setUserOption(msg.author.id, 'title', title)
      return sr`Your title has been set to \`\`\`${title}\`\`\``
    }
  }, {
    description: 'Set your title',
    fullDescription: 'Set your title'
  })
  bot.registerCommand('profile', (msg, args) => {
    try {
      let target = msg.author
      let member = msg.member
      if(msg.mentions && msg.mentions[0]) target = msg.mentions[0]
      if(msg.mentions && msg.mentions[0]) member = msg.channel.guild.members.get(target.id)
      if(!member) return sr`Please provid a value member that is in this server as a mention.`
      let embed = new RichEmbed()
      embed.setErisAuthor(target)
      embed.setColor(colorcfg.purple)
      embed.setThumbnail(target.avatarURL)
      embed.setDescription(db.getUserOption(target.id, 'title') || 'No title defined', true)
      embed.addField('💵 CycloneCoins', db.getUserOption(target.id, 'balance') || 'Account not opened', true)
      embed.addField('Account Creation', `${moment(target.createdAt).format('MMMM Do YYYY, h:mm:ss a')} (${moment(target.createdAt).fromNow()})`, true)
      embed.addField('Joined', `${moment(member.joinedAt).format('MMMM Do YYYY, h:mm:ss a')} (${moment(member.joinedAt).fromNow()})`, true)
      msg.channel.createMessage({embed})
    } catch(ex) {
      console.error(ex)
    }
    
  }, {
    description: 'View the profile of someone',
    fullDescription: 'View the profile of someone',
    guildOnly: true
  })


  log.info('Misc commands registered')
}