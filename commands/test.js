const sr = require('common-tags').stripIndents
const RichEmbed = require('../embed')
const moment = require('moment')
var _rcmds = []
var index = 0
module.exports = function (bot, db, log) {  
  const colorcfg = {
    green: '#139A43',
    red: '#DA2C38',
    blue: '#256EFF',
    purple: '#5E239D',
    green2: '#0DAB76'
  }
  bot.registerCommand('testhelp', (msg, args) => {
    let commands = bot.commands
    let cmdsl = commands.length
    let rcmds = []
    for(let _c in commands) {
      if(!commands.hasOwnProperty(_c)) continue
      let c = commands[_c]
      rcmds.push(c)
      _rcmds = rcmds
    }
    let embed = new RichEmbed()
    embed.setColor(colorcfg.purple)
    embed.setErisAuthor(msg.author)
    embed.addField('Command', `cy!${_rcmds[index].label}`)
    embed.addField('Description', `${_rcmds[index].description}`)
    return {embed: embed.toJSON()}
  }, { 
    description: 'Test help',
    fullDescription: 'Helping test',
    reactionButtons: [
      {
        emoji: '⬅',
        type: 'edit',
        response: (msg) => {
          let embed = new RichEmbed()
          index = index - 1
          embed.setColor(colorcfg.purple)
          embed.setErisAuthor(msg.author)
          embed.addField('Command', `cy!${_rcmds[index].label}`)
          embed.addField('Description', `${_rcmds[index].description}`)
          msg.edit({embed: embed})
        }
      },
      {
        emoji: '⏹',
        type: 'edit',
        response: (msg) => {
          msg.edit('stop')
        }
      },
      {
        emoji: '➡',
        type: 'edit',
        response: (msg) => {
          let embed = new RichEmbed()
          index = index + 1
          embed.setColor(colorcfg.purple)
          embed.setErisAuthor(msg.author)
          embed.addField('Command', `cy!${_rcmds[index].label}`)
          embed.addField('Description', `${_rcmds[index].description}`)
          msg.edit({embed: embed})
        }
      }
    ],
    requirements: {
      userIDs: ['116693403147698181']
    },
    reactionButtonTimeout: 15000
  })
}