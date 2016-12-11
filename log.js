/**
 * Project............: Cyclone
 * File...............: log.js
 * Author.............: Relative
 * Created on.........: 11/23/2016
 */
const chalk   = require('chalk')
const moment  = require('moment')
const fs      = require('fs')
const Discord = require('discord.js')
const x       = new Discord.Client()
function logToFile(level, msg){
  let time = moment().format('MM-DD-YY hh:mm:ssA')
  let date = moment().format('MM-DD-YYYY')
  if(!fs.existsSync(`${__dirname}\\logs`)) fs.mkdirSync(`${__dirname}\\logs`)
  fs.appendFile(`${__dirname}\\logs\\log.${date}.log`, `[${level}] [${time}] ${msg}`, (err) => {
    if(err){
      console.log(chalk.bold.bgRed(`[LOG ERROR] [${time}] `) + 'FAILED TO WRITE TO FILE!!')
      throw err
    }
  })
}

function logToFileServer(server,channel,user,msg){
  let time = moment().format('MM-DD-YY hh:mm:ssA')
  let date = moment().format('MM-DD-YYYY')
  if(!fs.existsSync(`${__dirname}\\logs`)) fs.mkdirSync(`${__dirname}\\logs`)
  fs.appendFile(`${__dirname}\\logs\\${server.id}.${date}.msg.log`, `[${time}] [#${channel.name}] ${user.username}#${user.discriminator}: ${msg.cleanContent}\n`, (err) => {
    if(err){
      console.log(chalk.bold.bgRed(`[LOG ERROR] [${time}] `) + 'FAILED TO WRITE TO FILE!!')
      throw err
    }
  })
}

module.exports.serverLogMsg = (server, channel, user, msg) => {
  logToFileServer(server,channel,user,msg)
}

function logToServer(level, msg){
  let embed = new Discord.RichEmbed()
  embed.setTitle(level)
  if(level === 'LOG'){
    embed.setColor('#2ECC40')
  }else if(level === 'WARN'){
    embed.setColor('#FF851B')
  }else if(level === 'ERROR'){
    embed.setColor('#FF4136')
  }
  embed.setDescription(msg)
  embed.setTimestamp(new Date())
  module.exports.bot.channels.get('257312863914295297').sendEmbed(embed)
}

module.exports.log = function(msg){
  let time = moment().format('MM-DD-YY hh:mm:ssA')
  console.log(chalk.bold.green(`[LOG] [${time}] `) + msg)
  logToFile("LOG", msg)
  logToServer("LOG", msg)
}
module.exports.warn = function(msg){
  let time = moment().format('MM-DD-YY hh:mm:ssA')
  console.log(chalk.bold.yellow(`[WARN] [${time}] `) + msg)
  logToFile("WARN", msg)
  logToServer("WARN", msg)
}
module.exports.error = function(msg){
  let time = moment().format('MM-DD-YY hh:mm:ssA')
  console.log(chalk.bold.bgRed(`[ERROR] [${time}] `) + msg)
  logToFile("ERROR", msg)
  logToServer("ERROR", msg)

}

module.exports.init = function(bot){
  module.exports.bot = bot
}

module.exports.newEmbed = (channel, title, description, color) => {
  let msgOpts = {
    embed: {
      title: title,
      color: parseInt(color.replace('#', ''), 16),
      description: description,
      timestamp: `${new Date().toISOString()}`
    }
  }
  channel.sendMessage('', msgOpts)
}