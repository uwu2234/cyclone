/**
 * Project............: Cyclone
 * File...............: index.js
 * Author.............: Relative
 * Created on.........: 11/23/2016
 */
const config = require('./config.json')
const Discord = require('discord.js')
const commands = require('./commands')

const bot = new Discord.Client()

bot.on('ready', () => {
  commands.init() // Initializes built in commands (!help)
  console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-')
  console.log(`${bot.user.username}#${bot.user.discriminator} is now online.`)
  console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-\n\n')
  console.log('-=-=| Serving |=-=-')
  console.log(`${bot.guilds.array().length} servers`)
  console.log(`${bot.channels.array().length} channels`)
  console.log(`${bot.users.array().length} users`)
  bot.setStatus('dnd')
  bot.setGame(`Cyclone ${require('./package.json').version} | ${config.prefix}help`)
})

bot.on('message', (msg) => {
  let handled = commands.handleCommand(msg)
  if(!handled){
    console.log('unhandled')
  }else{
    console.log('handled')
  }
})

bot.login(config.token)