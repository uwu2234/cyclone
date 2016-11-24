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


