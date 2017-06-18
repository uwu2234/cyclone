const sr = require('common-tags').stripIndents
const requestify = require('requestify')
const Sentry = require('winston-sentry')
const RichEmbed = require('./embed')
require('winston-daily-rotate-file')
const winston = require('winston')
const Database = require('./db')
const {NodeVM} = require('vm2')
const path = require('path')
const Eris = require('eris')
const vm = require('vm')
const fs = require('fs-extra')
const db = new Database()
const config = require('./config.json')

String.prototype.replaceAll = function(target, replacement) { return this.split(target).join(replacement); };
var log = new (winston.Logger)({
  level: process.env.ENV === 'development' ? 'debug' : 'info',
  transports: [
    new (winston.transports.Console)({
      colorize: true
    }),
    new (winston.transports.DailyRotateFile)({
      name: 'file',
      datePattern: 'log.yyyy-MM-dd',
      filename: path.join('logs', '.log'),
      localTime: true,
      json: false,
      prepend: true,
      level: process.env.NODE_ENV === 'dev' ? 'debug' : 'info'
    }),
    new Sentry({
      level: 'warn',
      dsn: 'https://162d4b510da44c1e94f480c97452a05d:d9a9a1db561f45e2b1521341bcd40cad@sentry.io/180885',
      tags: {
        version: require('./package.json').version, 
        environment: process.env.NODE_ENV
      }
    })
  ]
})
const bot = new Eris.CommandClient(config.token, {
  maxShards: config.sharding.shardCount,
  autoReconnect: true,
  getAllUsers: true
}, {
  description: `Cyclone v${require('./package.json').version}`,
  owner: 'Relative',
  prefix: 'cy!',
  defaultCommandOptions: {
    cooldownMessage: `Please wait to use this command again!`,
    permissionMessage: `⛔ You don't have permission to use this command!`,
    errorMessage: `⛔ This command failed to execute! Try again later!`
  }
})
const colorcfg = {
  green: '#139A43',
  red: '#DA2C38',
  blue: '#256EFF',
  purple: '#5E239D',
  green2: '#0DAB76'
}
function blacklisted(msg, args) {
  if(typeof (db.getServerOption(msg.channel.guild.id, 'blacklisted')) != 'undefined' && db.getServerOption(msg.channel.guild.id, 'blacklisted') == true) {
    let embed = new RichEmbed()
    embed.setColor(colorcfg.red)
    embed.setTitle('Blacklisted')
    embed.setDescription('Sorry, but you or the server was blacklisted from using Cyclone! Apologies! **server**')
    embed.setTimestamp()
    msg.channel.createMessage({embed: embed.toJSON()})
    return true
  }
  if(typeof (db.getUserOption(msg.author.id, 'blacklisted')) != 'undefined' && db.getUserOption(msg.author.id, 'blacklisted') == true) {
    let embed = new RichEmbed()
    embed.setColor(colorcfg.red)
    embed.setTitle('Blacklisted')
    embed.setDescription('Sorry, but you or the server was blacklisted from using Cyclone! Apologies! **user**')
    embed.setTimestamp()
    msg.channel.createMessage({embed: embed.toJSON()})
    return true
  }
  return false
}
 
/* log events & ready events */
bot
  .on('ready', () => {
    log.info('Cyclone is ready.')
    bot.editStatus('online', {
      name: `cy!help`,
      type: 1,
      url: 'https://twitch.tv/directory'
    })
  })
  .on('shardReady', (id) => {
    log.info(`Shard ${id} connected`)
  })
  .on('debug', (message, id) => {
    log.debug(`[shard ${id}]: ${message}`)
  })
  .on('warn', (message, id) => {
    log.warn(`[shard ${id}]: ${message}`)
  })
  .on('error', (err, id) => {
    log.error(`[shard ${id}]: ${err}`)
  })

/* other events */
bot.on('guildMemberUpdate', (guild, member, oldMember) => {
  if (member.roles != oldMember.roles) {
    if (member.roles.indexOf('259592767867584512') != -1) {
      if (member.bot == false) {
        member.removeRole('259592767867584512', 'Role automatically removed by Cyclone. Bot role is only for OAuth bots.')
      }
    }
  }
})


require('./commands/misc')(bot, db, log)
require('./commands/admin')(bot, db, log)
require('./commands/db')(bot, db, log)
//require('./commands/sbeval')(bot, db, log) 

let moneyCommand = bot.registerCommand('money', (msg, args) => {
  if(blacklisted(msg, args)) return
  return sr`Invalid usage.
  \`cy!money [balance|pay|flip|]\``
})
moneyCommand.registerSubcommand('balance', (msg, args) => {
  if(blacklisted(msg, args)) return
  return 'wip'
})

bot.connect()