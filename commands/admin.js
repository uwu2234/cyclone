const sr = require('common-tags').stripIndents
const RichEmbed = require('../embed')
const vm = require('vm')
const util = require('util')
const r = require('../dbapi')
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
  serverCommand.registerSubcommand('blacklist', async (msg, args) => {
    let guild = bot.guilds.get(args.join(''))
    if (guild = bot.guilds.get(args.join(''))) {
      await db.checkServer(guild)
      db.r.table('servers').get(guild.id).update({blacklisted: true}).run()
      let embed = new RichEmbed()
      embed.setColor(colorcfg.red)
      embed.setAuthor(guild.name)
      embed.setTitle('Blacklisted')
      embed.setDescription(sr`Blacklisted server ${guild.name} (${guild.id}) successfully.`)
      msg.channel.createMessage({ embed: embed.toJSON() })
    } else {
      await db.makeServer(args.join(''))
      db.r.table('servers').get(args.join('')).update({blacklisted: true}).run()
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
  serverCommand.registerSubcommand('unblacklist', async (msg, args) => {
    let guild = bot.guilds.get(args.join(''))
    if (guild = bot.guilds.get(args.join(''))) {
      await db.checkServer(guild)
      db.r.table('servers').get(guild.id).update({blacklisted: false}).run()
      let embed = new RichEmbed()
      embed.setColor(colorcfg.green)
      embed.setAuthor(guild.name)
      embed.setTitle('Unblacklisted')
      embed.setDescription(sr`Unblacklisted server ${guild.name} (${guild.id}) successfully.`)
      msg.channel.createMessage({ embed: embed.toJSON() })
    } else {
      await db.makeServer(args.join(''))
      db.r.table('servers').get(args.join('')).update({blacklisted: false}).run()
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
  userCommand.registerSubcommand('blacklist', async (msg, args) => {
    let user = bot.users.get(args.join(''))
    if (user = bot.users.get(args.join(''))) {
      await db.checkUser(user)
      db.r.table('users').get(user.id).update({blacklisted: true}).run()
      let embed = new RichEmbed()
      embed.setColor(colorcfg.red)
      embed.setAuthor(user.username)
      embed.setTitle('Blacklisted')
      embed.setDescription(sr`Blacklisted user ${user.username}#${user.discriminator} successfully.`)
      msg.channel.createMessage({ embed: embed.toJSON() })
    } else {
      await db.makeUser(args.join(''))
      db.r.table('users').get(args.join('')).update({blacklisted: true}).run()
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
  userCommand.registerSubcommand('unblacklist', async (msg, args) => {
    let user = bot.users.get(args.join(''))
    if (user = bot.users.get(args.join(''))) {
      await db.checkUser(user)
      db.r.table('users').get(user.id).update({blacklisted: false}).run()
      let embed = new RichEmbed()
      embed.setColor(colorcfg.green)
      embed.setAuthor(user.username)
      embed.setTitle('Unblacklisted')
      embed.setDescription(sr`Unblacklisted user ${user.username}#${user.discriminator} successfully.`)
      msg.channel.createMessage({ embed: embed.toJSON() })
    } else {
      await db.makeUser(args.join(''))
      db.r.table('users').get(args.join('')).update({blacklisted: false}).run()
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
      var embed = new RichEmbed()
      embed.setColor(colorcfg.green2)
      embed.setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL)
      embed.setTitle('Executed')
      embed.setDescription(`**Result:** \`\`\`${res}\`\`\``)
      embed.setTimestamp()
      msg.channel.createMessage({ embed: embed.toJSON() })
      embed = undefined
      return
    } catch (ex) {
      var embed = new RichEmbed()
      embed.setColor(colorcfg.red)
      embed.setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL)
      embed.setTitle('Error')
      embed.setDescription(`**Error:** \`\`\`${ex}\`\`\``)
      embed.setTimestamp()
      msg.channel.createMessage({ embed: embed.toJSON() })
      embed = undefined
      return
    }
  }, {
    requirements: {
      userIDs: ['116693403147698181']
    },
    description: 'Evaluate JavaScript code on Cyclone',
    fullDescription: 'Evaluate JavaScript code on Cyclone'
  })

  bot.registerCommand('vm', (msg, args) => {
    try {
      let sandbox = {
        message: msg,
        args: args,
        bot: bot,
        db: db,
        Embed: RichEmbed
      }
      vm.createContext(sandbox)
      let code = args.join(' ').replaceAll('`', '')
      let res = vm.runInContext(code, sandbox)
      var embed = new RichEmbed()
      embed.setColor(colorcfg.green2)
      embed.setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL)
      embed.setTitle('Executed')
      embed.setDescription(`**Result:** \`\`\`${res}\`\`\`\n**Sandbox:** \`\`\`${util.inspect(sandbox)}\`\`\``)
      embed.setTimestamp()
      msg.channel.createMessage({ embed: embed.toJSON() })
      embed = undefined
      return
    } catch (ex) {
      var embed = new RichEmbed()
      embed.setColor(colorcfg.red)
      embed.setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL)
      embed.setTitle('Error')
      embed.setDescription(`**Error:** \`\`\`${ex}\`\`\``)
      embed.setTimestamp()
      msg.channel.createMessage({ embed: embed.toJSON() })
      embed = undefined
      return
    }
  }, {
    requirements: {
      userIDs: ['116693403147698181']
    },
    description: 'Evaluate JavaScript code on Cyclone in a Node VM',
    fullDescription: 'Evaluate JavaScript code on Cyclone in a Node VM'
  })

  log.info('Admin commands registered')
}