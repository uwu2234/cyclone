const sr = require('common-tags').stripIndents
const RichEmbed = require('../embed')
const moment = require('moment')
var indexes = {}
var cmdsu = {}
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
  let prefixCommand = bot.registerCommand('prefix', (msg, args) => {
    bot.registerGuildPrefix(msg.channel.guild.id, ['@mention ', args[0] + ' '])
    db.r.table('servers').get(msg.channel.guild.id).update({prefix: args[0] + ' '}).run()
    return `Prefix set to \`${args[0]}\``
  }, {
    description: 'Set the prefix for the current guild (requires ADMINISTRATOR perm)',
    fullDescription: 'Set the prefix for the current guild (requires ADMINISTRATOR perm)',
    guildOnly: true,
    argsRequired: true,
    requirements: {
      userIDs: ['116693403147698181'],
      permissions: {
        administrator: true
      }
    }
  })
  prefixCommand.registerSubCommand('reset', (msg, args) => {
    db.r.table('servers').get(msg.channel.guild.id).update({prefix: undefined}).run()
    bot.registerGuildPrefix(msg.channel.guild.id, ['cy!', '@mention '])
    return `Prefix reset to \`cy!\``
  }, {
    description: 'Set the prefix for the current guild (requires ADMINISTRATOR perm)',
    fullDescription: 'Set the prefix for the current guild (requires ADMINISTRATOR perm)',
    guildOnly: true,
    argsRequired: true,
    requirements: {
      userIDs: ['116693403147698181'],
      permissions: {
        administrator: true
      }
    }
  })
}