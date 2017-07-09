const sr = require('common-tags').stripIndents
const RichEmbed = require('../embed')
const moment = require('moment')
const config = require('../config')
const env = process.env.NODE_ENV
const util = require('util')
const wolfram = require('wolfram-alpha').createClient(config.secrets.wolfram || config.secrets.wolframAlpha)
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
function cleaner(txt) {
  return txt.replaceAll('68.61.205.217', '69.420.69.420').replaceAll('69.195.152.138', '420.420.420.420').replaceAll('69.14.38.199', 'nog.ger.cla.ssi.c').replaceAll('::ffff:443d:cdd9', '69.420.69.420')
}
module.exports = (bot, db, log) => {
  const colorcfg = {
    green: '#139A43',
    red: '#DA2C38',
    blue: '#256EFF',
    purple: '#5E239D',
    green2: '#0DAB76'
  }
  bot.registerCommand('wolfram', async (msg, args) => {
    let query = args.join(' ')
    var results = await wolfram.query(query)
    let res = results[0]
    let subpods = []
    for(let key in results) {
      if(!results.hasOwnProperty(key)) continue
      let val = results[key]
      if(val.primary == true) {
        res = val
      } else {
        if(val.subpods && val.subpods[0] && val.subpods[0].text) {
          console.dir(val.subpods[0])
          subpods.push({
            title: val.title,
            text: val.subpods[0].text
          })
        }
      }
    }
    if(!res) {
      return 'No results found...'
    }
    let embed = new RichEmbed()
    embed.setColor(colorcfg.purple)
    embed.setTitle(`\`${query}\``)
    embed.addField(res.title, res.subpods[0].text)
    console.dir(subpods)
    if(res.subpods && res.subpods[0] && res.subpods[0].image) {
      embed.setImage(res.subpods[0].image)
    }
    for(let key in subpods) {
      if(!subpods.hasOwnProperty(key)) continue
      let subpod = subpods[key]
      if(subpod.text) {
        embed.addField(subpod.title, cleaner(subpod.text))
      }
    }
    embed.setTimestamp()
    return {embed: embed}
  }, {
    description: 'Abuse wolfram alpha with this command (not really pls)',
    cooldown: 3450,
    aliases: ['wolf', 'wa']
  })
  log.info("Registered test commands")
}