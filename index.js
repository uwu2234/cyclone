/**
 * Project............: Cyclone
 * File...............: index.js
 * Author.............: Relative
 * Created on.........: 11/23/2016
 */
const config = require('./config.json')
const Discord = require('discord.js')
const commands = require('./commands')

const client = new Discord.Client()

client.on('ready', () => {
  commands.init() // Initializes built in commands (!help)
})

client.on('message', (msg) => {
  let handled = commands.handleCommand(msg)
  if(!handled){
    console.log('unhandled')
  }else{
    console.log('handled')
  }
})

client.login(config.token)