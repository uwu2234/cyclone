const sr = require('common-tags').stripIndents
const RichEmbed = require('../embed')
const requestify = require('requestify')
const config = require('../config')
const env = process.env.NODE_ENV
  const colorcfg = {
    green: '#139A43',
    red: '#DA2C38',
    blue: '#256EFF',
    purple: '#5E239D',
    green2: '#0DAB76'
  }
function resEmbed(res, msg) {
  let stats = res["Stats"].split(', ')
if (res["Warnings"]) {
          var embed = new RichEmbed()
          embed.setColor(colorcfg.green2)
          embed.setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL)
          embed.setTitle('Executed with warnings')
          embed.setDescription(`**Execution time:** \`${stats[0].replace('Absolute running time: ', '')}\`
**Warning(s):** \`\`\`${res["Warnings"]}\`\`\`
**Result:** \`\`\`${res["Result"]}\`\`\``)
          embed.setTimestamp()
          msg.channel.createMessage({ embed: embed.toJSON() })
          embed = undefined
          return
        } else if (res["Errors"]) {
          var embed = new RichEmbed()
          embed.setColor(colorcfg.red)
          embed.setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL)
          embed.setTitle('Error')
          embed.setDescription(`**Error(s):** \`\`\`${res["Errors"]}\`\`\``)
          embed.setTimestamp()
          msg.channel.createMessage({ embed: embed.toJSON() })
          embed = undefined
          return
        } else {
          var embed = new RichEmbed()
          embed.setColor(colorcfg.green2)
          embed.setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL)
          embed.setTitle('Executed')
          embed.setDescription(`**Execution time:** \`${stats[0].replace('Absolute running time: ', '')}\`
**Result:** \`\`\`${res["Result"]}\`\`\``)
          embed.setTimestamp()
          msg.channel.createMessage({ embed: embed.toJSON() })
          embed = undefined
          return
        }
}
module.exports = function (bot, db, log) {

  bot.registerCommand('sbeval', (msg, args) => {
    let code = args.join(' ')
    requestify.post(`http://rextester.com/rundotnet/Run`, {
      LanguageChoiceWrapper: 23,
      EditorChoiceWrapper: 1,
      Program: code,
      IsInEditMode: false,
      IsLive: false
    }, {
        dataType: 'form-url-encoded'
      }).then((response) => {
        let res = response.getBody()
        var stats = []
        res = res.replaceAll('":null', '": ""')
        res = JSON.parse(res)
        stats = res["Stats"].split(', ')
        resEmbed(res, msg)
      }).catch((err) => {
        console.log(err)
      })
  })

  bot.registerCommand('pyeval', (msg, args) => {
    let code = args.join(' ')
    requestify.post(`http://rextester.com/rundotnet/Run`, {
      LanguageChoiceWrapper: 24,
      EditorChoiceWrapper: 1,
      Program: code,
      IsInEditMode: false,
      IsLive: false
    }, {
        dataType: 'form-url-encoded'
      }).then((response) => {
        let res = response.getBody()
        var stats = []
        res = res.replaceAll('":null', '": ""')
        res = JSON.parse(res)
        stats = res["Stats"].split(', ')

        resEmbed(res, msg)
      }).catch((err) => {
        console.log(err)
      })
  })
  bot.registerCommand('swifteval', (msg, args) => {
    let code = args.join(' ')
    requestify.post(`http://rextester.com/rundotnet/Run`, {
      LanguageChoiceWrapper: 37,
      EditorChoiceWrapper: 1,
      Program: code,
      IsInEditMode: false,
      IsLive: false
    }, {
        dataType: 'form-url-encoded'
      }).then((response) => {
        let res = response.getBody()
        var stats = []
        res = res.replaceAll('":null', '": ""')
        res = JSON.parse(res)
        stats = res["Stats"].split(', ')

        resEmbed(res, msg)
      }).catch((err) => {
        console.log(err)
      })
  })
  bot.registerCommand('luaeval', (msg, args) => {
    let code = args.join(' ')
    requestify.post(`http://rextester.com/rundotnet/Run`, {
      LanguageChoiceWrapper: 14,
      EditorChoiceWrapper: 1,
      Program: code,
      IsInEditMode: false,
      IsLive: false
    }, {
        dataType: 'form-url-encoded'
      }).then((response) => {
        let res = response.getBody()
        var stats = []
        res = res.replaceAll('":null', '": ""')
        res = JSON.parse(res)
        stats = res["Stats"].split(', ')

        resEmbed(res, msg)
      }).catch((err) => {
        console.log(err)
      })
  })
  bot.registerCommand('goeval', (msg, args) => {
    let code = args.join(' ')
    requestify.post(`http://rextester.com/rundotnet/Run`, {
      LanguageChoiceWrapper: 20,
      EditorChoiceWrapper: 1,
      Program: `package main
      import "fmt"
      func main() {
        ${code}
      }`,
      IsInEditMode: false,
      IsLive: false
    }, {
        dataType: 'form-url-encoded'
      }).then((response) => {
        let res = response.getBody()
        var stats = []
        res = res.replaceAll('":null', '": ""')
        res = JSON.parse(res)
        stats = res["Stats"].split(', ')

        resEmbed(res, msg)
      }).catch((err) => {
        console.log(err)
      })
  })
  bot.registerCommand('ceval', (msg, args) => {
    let code = args.join(' ')
    requestify.post(`http://rextester.com/rundotnet/Run`, {
      LanguageChoiceWrapper: 6,
      EditorChoiceWrapper: 1,
      Program: code,
      IsInEditMode: false,
      IsLive: false,
      CompilerArgs: '-Wall -std=gnu99 -O2 -o a.out source_file.c'
    }, {
        dataType: 'form-url-encoded'
      }).then((response) => {
        let res = response.getBody()
        var stats = []
        res = res.replaceAll('":null', '": ""')
        res = JSON.parse(res)
        stats = res["Stats"].split(', ')

        resEmbed(res, msg)
      }).catch((err) => {
        console.log(err)
      })
  })
  bot.registerCommand('asmeval', (msg, args) => {
    let code = args.join(' ')
    requestify.post(`http://rextester.com/rundotnet/Run`, {
      LanguageChoiceWrapper: 15,
      EditorChoiceWrapper: 1,
      Program: code.replaceAll('```', ''),
      IsInEditMode: false,
      IsLive: false,
      CompilerArgs: '-Wall -std=gnu99 -O2 -o a.out source_file.c'
    }, {
        dataType: 'form-url-encoded'
      }).then((response) => {
        let res = response.getBody()
        var stats = []
        res = res.replaceAll('":null', '": ""')
        res = JSON.parse(res)
        stats = res["Stats"].split(', ')

        resEmbed(res, msg)
      }).catch((err) => {
        console.log(err)
      })
  })
  log.info('Sandboxed eval commands registered')
}