const sr = require('common-tags').stripIndents
const RichEmbed = require('../embed')
const moment = require('moment')
const config = require('../config')
const env = process.env.NODE_ENV
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
    embed.addField('Version', env == 'prod' ? require('../package.json').version : require('../package.json').version+'-dev', true)
    embed.addField('Owner', '<@116693403147698181>', true)
    embed.addField('Guilds', bot.guilds.size, true)
    embed.addField('Users', bot.users.size, true)
    embed.addField('Library', 'Eris', true)
    embed.addField('Environment', env == 'prod' ? 'Production' : 'Development')
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
  bot.registerCommand('title', async (msg, args) => {
    if(typeof args == 'undefined' || args[0] == null) {
      let user = await db.getUser(msg.author)
      let title = user.title
      if(typeof title ==  'undefined') {
        return sr`You do not have a title.
        To set one, run the command \`cy!title this is my title\``
      }
      return sr`Your title is \`\`\`${title}\`\`\``
    } else {
      let title = args.join(' ')
      db.r.table('users').get(msg.author.id).update({title: title}).run()
      return sr`Your title has been set to \`\`\`${title}\`\`\``
    }
  }, {
    description: 'Set your title',
    fullDescription: 'Set your title'
  })
  bot.registerCommand('invite', 'https://discordapp.com/oauth2/authorize?client_id=194960506308526080&scope=bot&permissions=70642880', {
    description: 'Invite URL for Cyclone',
    fullDescription: 'Run this command to get the invite URL to add Cyclone to your server.',
    aliases: ['oauth', 'oauth2', 'join']
  })
  bot.registerCommand('support', 'https://discord.gg/BDgGx5N', {
    description: 'Cyclone support server',
    fullDescription: 'The support server for Cyclone'
  })
  bot.registerCommand('server', async (msg, args) => {
    let server = msg.channel.guild
    //console.log(server.id)
    let guild = await db.getServer(server)
    let premium = guild.premium
    let embed = new RichEmbed()
    embed.setErisAuthor(msg.author)
    embed.setColor(colorcfg.blue)
    embed.addField('Name', server.name, true)
    embed.addField('Region', server.region, true)
    embed.addField('Members', server.memberCount, true)
    embed.addField('Owner', `<@${server.ownerID}>`, true)
    embed.addField('Created', `${moment(server.createdAt).format('MMMM Do YYYY, h:mm:ss a')} (${moment(server.createdAt).fromNow()})`, true)
    embed.addField('ID', server.id, true)
    embed.setThumbnail(server.iconURL)
    if(premium) embed.addField('<:premium:332571056940515328> Premium', 'Premium Server', true)
    embed.setTimestamp()
    msg.channel.createMessage({embed: embed})
  }, {
    description: 'View information about the current server',
    fullDescription: 'View information about the current server',
    guildOnly: true
  })

  bot.registerCommand('profile', async (msg, args) => {
    try {
      let target = msg.author
      let member = msg.member
      if(msg.mentions && msg.mentions[0]) target = msg.mentions[0]
      if(msg.mentions && msg.mentions[0]) member = msg.channel.guild.members.get(target.id)
      if(!member) return sr`Please provide a value member that is in this server as a mention.`
      let user = await db.getUser(target)
      let bal = user.balance
      let title = user.title
      let registered = user.registered
      let admin = user.admin
      let dev = user.dev
      let embed = new RichEmbed()
      embed.setErisAuthor(target)
      embed.setColor(colorcfg.purple)
      embed.setThumbnail(target.avatarURL)
      embed.setDescription(title || '*No title defined*', true)
      if (admin) embed.addField('<:stafftools:314348604095594498> Admin', 'Cyclone Admin')
      if (dev) embed.addField('<:stafftools:314348604095594498> Developer', 'Cyclone Developer')
      embed.addField('💵 CycloneCoins', registered ? bal : '*Account not opened*', true)
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

  bot.registerCommand('stats', async (msg, args) => {
    let msgs = await db.r.table('stats').get('message')
    let count = msgs.count
    let embed = new RichEmbed()
    embed.setColor(colorcfg.purple)
    embed.setTitle('🔢 `Top 5 Commands`')
    embed.addField(msgs.friendlyName, count)
    embed.setTimestamp()
    return {embed}
  }, {
    cooldown: 5000,
    description: 'Show the top 5 commands by usage.'
  })


  log.info('Misc commands registered')
}