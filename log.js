/**
 * Project............: Cyclone
 * File...............: log.js
 * Author.............: Relative
 * Created on.........: 11/23/2016
 */
const chalk   = require('chalk')
const moment  = require('moment')
const fs      = require('fs')

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

module.exports.log = function(msg){
  let time = moment().format('MM-DD-YY hh:mm:ssA')
  console.log(chalk.bold.green(`[LOG] [${time}] `) + msg)
  logToFile("LOG", msg)
}
module.exports.warn = function(msg){
  let time = moment().format('MM-DD-YY hh:mm:ssA')
  console.log(chalk.bold.yellow(`[WARN] [${time}] `) + msg)
  logToFile("WARN", msg)
}
module.exports.error = function(msg){
  let time = moment().format('MM-DD-YY hh:mm:ssA')
  console.log(chalk.bold.bgRed(`[ERROR] [${time}] `) + msg)
  logToFile("ERROR", msg)
}


module.exports.generateUserBanned = (guild, user) => {
  let ret = {
    embeds: [{
      title: 'User Banned',
      author: {
        name: `${user.username}#${user.discriminator} (${user.id})`,
        icon_url: user.avatarURL
      },
      footer: {
        text: 'Logging courtesy of Cyclone.',
        icon_url: 'https://cdn.discordapp.com/app-icons/194960506308526080/d315c2187aeeee0774037bdc419ae1ff.jpg'
      },
      description: `User has been banned from ${guild.name}\n`,
      timestamp: `${new Date().toISOString()}`
    }]
  }
  return ret
}

module.exports.generateUserUnbanned = (guild, user) => {
  let ret = {
    embeds: [{
      title: 'User Unbanned',
      author: {
        name: `${user.username}#${user.discriminator} (${user.id})`,
        icon_url: user.avatarURL
      },
      footer: {
        text: 'Logging courtesy of Cyclone.',
        icon_url: 'https://cdn.discordapp.com/app-icons/194960506308526080/d315c2187aeeee0774037bdc419ae1ff.jpg'
      },
      description: `User has been unbanned from ${guild.name}\n`,
      timestamp: `${new Date().toISOString()}`
    }]
  }
  return ret
}

module.exports.generateMessageDelete = (msg) => {
  let ret = {
    embeds: [{
      title: 'Message Deleted',
      author: {
        name: `${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
        icon_url: msg.author.avatarURL
      },
      footer: {
        text: 'Logging courtesy of Cyclone.',
        icon_url: 'https://cdn.discordapp.com/app-icons/194960506308526080/d315c2187aeeee0774037bdc419ae1ff.jpg'
      },
      description: `${msg.cleanContent}\n`,
      timestamp: `${new Date().toISOString()}`
    }]
  }
  return ret
}



