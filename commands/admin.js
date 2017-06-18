const sr = require('common-tags').stripIndents
const RichEmbed = require('../embed')
module.exports = function (bot, db, log) {
  const requirements = {
    requirements: {
      userIDs: ['116693403147698181']
    }
  }
  const colorcfg = {
    green: '#139A43',
    red: '#DA2C38',
    blue: '#256EFF',
    purple: '#5E239D',
    green2: '#0DAB76'
  }
  let adminCommand = bot.registerCommand('admin', sr`cy!admin [server|user]`, requirements)
  let serverCommand = adminCommand.registerSubcommand('server', sr`cy!admin server [bl|unbl]`, requirements)
  serverCommand.registerSubcommand('blacklist', (msg, args) => {
    let guild
    db.setServerOption(args.join(''), 'blacklisted', true)
    if (guild = bot.guilds.get(args.join(''))) {
      let embed = new RichEmbed()
      embed.setColor(colorcfg.red)
      embed.setAuthor(guild.name)
      embed.setTitle('Blacklisted')
      embed.setDescription(sr`Blacklisted server ${guild.name} (${guild.id}) successfully.`)
      msg.channel.createMessage({ embed: embed.toJSON() })
    } else {
      let embed = new RichEmbed()
      embed.setColor(colorcfg.red)
      embed.setAuthor('Server')
      embed.setTitle('Blacklisted')
      embed.setDescription(sr`Blacklisted server ${args.join('')} successfully.`)
      msg.channel.createMessage({ embed: embed.toJSON() })
    }
  }, {
    requirements: { userIDs: ['116693403147698181'] },
    aliases: [
      'bl'
    ],
    argsRequired: true
  })
  serverCommand.registerSubcommand('unblacklist', (msg, args) => {
    let guild
    db.setServerOption(args.join(''), 'blacklisted', false)
    if (guild = bot.guilds.get(args.join(''))) {

      let embed = new RichEmbed()
      embed.setColor(colorcfg.green)
      embed.setAuthor(guild.name)
      embed.setTitle('Unblacklisted')
      embed.setDescription(sr`Unblacklisted server ${guild.name} (${guild.id}) successfully.`)
      msg.channel.createMessage({ embed: embed.toJSON() })
    } else {
      let embed = new RichEmbed()
      embed.setColor(colorcfg.green)
      embed.setAuthor('Server')
      embed.setTitle('Unblacklisted')
      embed.setDescription(sr`Unblacklisted server ${args.join('')} successfully.`)
      msg.channel.createMessage({ embed: embed.toJSON() })
    }
  }, {
    requirements: { userIDs: ['116693403147698181'] },
    aliases: [
      'unbl'
    ],
    argsRequired: true
  })

  let userCommand = adminCommand.registerSubcommand('user', sr`cy!admin user [bl|unb|set]`, requirements)
  userCommand.registerSubcommand('blacklist', (msg, args) => {
    let user
    db.setUserOption(args.join(''), 'blacklisted', true)
    if (user = bot.users.get(args.join(''))) {
      let embed = new RichEmbed()
      embed.setColor(colorcfg.red)
      embed.setAuthor(user.username)
      embed.setTitle('Blacklisted')
      embed.setDescription(sr`Blacklisted user ${user.username}#${user.discriminator} successfully.`)
      msg.channel.createMessage({ embed: embed.toJSON() })
    } else {
      let embed = new RichEmbed()
      embed.setColor(colorcfg.red)
      embed.setAuthor('Server')
      embed.setTitle('Blacklisted')
      embed.setDescription(sr`Blacklisted user ${args.join('')} successfully.`)
      msg.channel.createMessage({ embed: embed.toJSON() })
    }
  }, {
    requirements: { userIDs: ['116693403147698181'] },
    aliases: [
      'bl'
    ],
    argsRequired: true
  })
  userCommand.registerSubcommand('unblacklist', (msg, args) => {
    let user
    db.setUserOption(args.join(''), 'blacklisted', false)
    if (user = bot.users.get(args.join(''))) {
      let embed = new RichEmbed()
      embed.setColor(colorcfg.green)
      embed.setAuthor(user.username)
      embed.setTitle('Unblacklisted')
      embed.setDescription(sr`Unblacklisted user ${user.username}#${user.discriminator} successfully.`)
      msg.channel.createMessage({ embed: embed.toJSON() })
    } else {
      let embed = new RichEmbed()
      embed.setColor(colorcfg.green)
      embed.setAuthor('Server')
      embed.setTitle('Unblacklisted')
      embed.setDescription(sr`Unblacklisted user ${args.join('')} successfully.`)
      msg.channel.createMessage({ embed: embed.toJSON() })
    }
  }, {
      requirements: { userIDs: ['116693403147698181'] },
      aliases: [
        'unbl'
      ],
      argsRequired: true
  })
  bot.registerCommand('eval', (msg, args) => {
    try {
      let code = args.join('')
      code = code.replaceAll('`', '')
      let res = eval(code)
      return sr`Result:
      \`\`\`${res}\`\`\``
    } catch (ex) {
      return sr`Your code resulted in an error.
      **STACKTRACE**
      \`\`\`${ex}\`\`\``
    }
  }, {
    requirements: {
      userIDs: ['116693403147698181']
    },
    description: 'Evaluate JavaScript code on Cyclone',
    fullDescription: 'Evaluate JavaScript code on Cyclone'
  })

  log.info('Admin commands registered')
}