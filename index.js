const sr = require('common-tags').stripIndents
const requestify = require('requestify')
const Sentry = require('winston-sentry')
const stripAnsi = require('strip-ansi')
const RichEmbed = require('./embed')
require('winston-daily-rotate-file')
const winston = require('winston')
const Database = require('./db')
const colors = require('colors')
const moment = require('moment')
const {NodeVM} = require('vm2')
const path = require('path')
const Eris = require('eris')
const vm = require('vm')
const fs = require('fs-extra')
const db = new Database()
var config = require('./config.json')
const env = process.env.NODE_ENV.substr(0,process.env.NODE_ENV.length - 1)
if(env == 'dev') config = require('./config.dev.json')
String.prototype.replaceAll = function(target, replacement) { return this.split(target).join(replacement); };
var log = new (winston.Logger)({
  level: env === 'dev' ? 'debug' : 'info',
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
      colorize: false,
      level: env === 'dev' ? 'debug' : 'info',
      formatter: (options) => {
        let msg = `${moment().format('YYYY-MM-DD HH:mm:ss.SSS')} - ${options.level}: ${stripAnsi(options.message)}`
        return msg
      }
    }),
    new Sentry({
      level: 'warn',
      dsn: 'https://162d4b510da44c1e94f480c97452a05d:d9a9a1db561f45e2b1521341bcd40cad@sentry.io/180885',
      tags: {
        version: require('./package.json').version, 
        environment: env
      }
    })
  ]
})
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
  if((process.env.NODE_ENV == 'dev') && (typeof db.getUserOption(msg.author.id, 'whitelisted') == 'undefined' || db.getUserOption(msg.author.id, 'whitelisted') == false)) {
    let embed = new RichEmbed()
    embed.setColor(colorcfg.red)
    embed.setTitle('Development Mode')
    embed.setDescription('Sorry, but the bot is in development mode and only whitelisted users may use the bot while in development mode.')
    embed.setTimestamp()
    msg.channel.createMessage({embed: embed.toJSON()})
    return true
  }
  return false
}
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
  },
  preCommand: blacklisted
})
const colorcfg = {
  green: '#139A43',
  red: '#DA2C38',
  blue: '#256EFF',
  purple: '#5E239D',
  green2: '#0DAB76'
}

console.log(env)
console.log(env)
if(env == 'dev') {
  log.debug('Cyclone is running in ' + 'development'.magenta + ' mode. Users not whitelisted will not be able to run any commands on the bot.')
  //TODO: any other logic for specifically dev environment.
}

/* log events & ready events */
bot
  .on('ready', () => {
    log.info(`${'Cyclone'.red} is ready.`)
    bot.editStatus('online', {
      name: `cy!help`,
      type: 1,
      url: 'https://twitch.tv/directory'
    })
  })
  .on('shardReady', (id) => {
    log.info(`Shard ${id.toString().cyan} connected`)
  })
  .on('shardResume', (id) => {
    log.info(`Shard ${id.toString().cyan} resumed`)
  })
  .on('shardDisconnect', (id) => {
    log.info(`Shard `.red + id.toString().cyan + ` disconnected`.red)
  })
  .on('debug', (message, id) => {
    if(typeof id != 'undefined' && id != null) return log.debug(`${'[Shard'.magenta + ' ' +  id.toString().cyan + ']'.magenta}: ${message}`)
    log.debug(`${message}`)
  })
  .on('warn', (message, id) => {
    if(typeof id != 'undefined' && id != null) return log.warn(`${'[Shard'.yellow + ' ' + id.toString().cyan + ']'.yellow}: ${message}`)
    log.warn(`${message}`)
  })
  .on('error', (err, id) => {
    if(typeof id != 'undefined' && id != null) return log.error(`${'[Shard'.red + ' ' + id.toString().cyan + ']'.red}: ${message}`)
    log.error(`${err}`)
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

bot.on('commandExecuted', (label, invoker, msg, args) => {
  log.info(`Command invoked by ${invoker.username}#${invoker.discriminator}: cy!${label} ${args.join(" ")}`)
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