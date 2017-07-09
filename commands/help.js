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
  bot.registerCommand('help', (msg, args) => {
    let commands = bot.commands
    let cmdsl = commands.length
    let rcmds = []
    for (let _c in commands) {
      if (!commands.hasOwnProperty(_c)) continue
      let c = commands[_c]
      if(!c.permissionCheck(msg)) continue
      rcmds.push(c)
      cmdsu[msg.author.id] = rcmds
    }
    let _rcmds = cmdsu[msg.author.id]
    if (!args || args.length == 0) {
      let buf = ''
      for (let _c in rcmds) {
        if(!rcmds.hasOwnProperty(_c)) continue
        let cmd = rcmds[_c]
        buf += `**cy!${cmd.label}** - *${cmd.description}*\n`
      }
      return buf
    } else if (args || args[0] == 'test') {
      let embed = new RichEmbed()
      let index = indexes[msg.author.id] = 0
      embed.setColor(colorcfg.purple)
      embed.addField('Command', `cy!${_rcmds[index].label}`)
      embed.addField('Description', `${_rcmds[index].description}`)
      return { embed }
    }
  }, {
      description: 'Shows help',
      fullDescription: 'Helping test',
      reactionButtons: [
        {
          emoji: '⬅',
          type: 'edit',
          response: (msg) => {
            let author = bot.activeMessages[msg.id].invoker
            let _rcmds = cmdsu[author]
            let index = indexes[author]
            index = index - 1
            if (index < 0) {
              index = index + 1
              index[author] = index
              return
            }
            let embed = new RichEmbed()
            indexes[author] = index
            embed.setColor(colorcfg.purple)
            embed.addField('Command', `cy!${_rcmds[index].label}`)
            embed.addField('Description', `${_rcmds[index].description}`)
            return { embed }
          }
        },
        {
          emoji: '⏹',
          type: 'cancel'
        },
        {
          emoji: '➡',
          type: 'edit',
          response: (msg) => {
            let author = bot.activeMessages[msg.id].invoker
            let _rcmds = cmdsu[author]
            let index = indexes[author]
            index = index + 1
            if (index < 0) return "wtf did you do? try again in 15 seconds..."
            let embed = new RichEmbed()
            indexes[author] = index
            embed.setColor(colorcfg.purple)
            embed.addField('Command', `cy!${_rcmds[index].label}`)
            embed.addField('Description', `${_rcmds[index].description}`)
            return { embed }
          }
        }
      ],
      /*disableReactionButtonsWithArgs: false,
      disableReactionButtonsWithoutArgs: true,*/
      reactionButtonsArg: 'test',
      reactionButtonTimeout: 30000
    })
}