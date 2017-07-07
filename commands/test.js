const sr = require('common-tags').stripIndents
const RichEmbed = require('../embed')
const moment = require('moment')
var indexes = {}
var _rcmds = []
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
    let index = indexes[msg.author.id] = 0
    embed.setColor(colorcfg.purple)
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
          let author = bot.activeMessages[msg.id].invoker
          let index = indexes[author]
          console.log('liA', index)
          index = index - 1
          console.log('liB', index)
          if(index < 0) {
            index = index + 1
            console.log('liZ', index)
            index[author] = index
            return
          }
          let embed = new RichEmbed()
          indexes[author] = index
          console.log('liC', index)
          embed.setColor(colorcfg.purple)
          console.log('liD', index)
          embed.addField('Command', `cy!${_rcmds[index].label}`)
          embed.addField('Description', `${_rcmds[index].description}`)
          return {embed}
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
          let index = indexes[author]
          console.log('riA', index)
          index = index + 1
          console.log('riB', index)
          if(index < 0) return "wtf did you do? try again in 15 seconds..."
          let embed = new RichEmbed()
          console.log('riC', index)
          indexes[author] = index
          console.log('riD', index)
          embed.setColor(colorcfg.purple)
          embed.addField('Command', `cy!${_rcmds[index].label}`)
          embed.addField('Description', `${_rcmds[index].description}`)
          return {embed}
        }
      }
    ],
    requirements: {
      userIDs: ['116693403147698181']
    },
    reactionButtonTimeout: 15000
  })
}