/**
 * Project............: Cyclone
 * File...............: index.js
 * Author.............: Relative
 * Created on.........: 11/23/2016
 */
const Discord = require('discord.js')
const mongoose = require('mongoose')

const config = require('./config.json')
const commands = require('./commands')
const logger = require('./log')
const api = require('./api')

const bot = new Discord.Client()
bot.on('ready', () => {
  mongoose.connect('admin:XpCdV6K1DWwq4BW0k0l@178.32.177.169/cyclone?authSource=admin&authMechanism=SCRAM-SHA-1') // Initialize Mongoose
  mongoose.Promise = global.Promise
  commands.init() // Initializes built in commands (!help)
  commands.registerCommand('balance', 'Retrieve your balance', (msg,args,apx) => {
    if(typeof args[1] === 'string'){
      let target = args[1].replace('<@', '').replace('>', '')
      api.getBalance(target, (err, balance) => {
        if(err){
          return apx.error('Failed to get target\'s balance! Please try again later.')
        }
        msg.reply(`${bot.users.find('id', target).username}'s balance is **${balance}**!`)
      })
    }else{
      api.getBalance(msg.author.id, (err, balance) => {
        if(err){
          return apx.error('Failed to get your balance! Please try again later.')
        }
        msg.reply(`Your balance is **${balance}**!`)
      })
    }

  })
  commands.registerCommand('setbalance', 'Set your balance', (msg,args,apx) => {
    let target = args[1].replace('<@', '').replace('>', '')
    let balance = parseInt(args[2])
    api.setBalance(target, balance, (err) => {
      if(err){
        return apx.error('Failed to set target\'s balance! Please try again later.')
      }
      msg.reply(`Their balance is now set to **${balance}**!`)
    })
  }, 'botAdmin')

  commands.registerCommand('warnings', 'Shows warnings for user', (msg,args,apx) => {
    let target = args[1].replace('<@', '').replace('>', '')
    api.getWarnings(target, (err, warnings) => {
      if(typeof warnings[1] == 'undefined'){
        return apx.success('Target has no warnings on record!')
      }
      let warns = `**Warning record for ${bot.users.find('id', target).username}**\n`
      let idx = 1
      warnings.forEach((warning) => {
        if(typeof warning === 'undefined' || !warning) return
        warns += api.digitsToEmoji(idx.toString()) + `${warning.reason} _punished by <@${warning.warner}>_`
        idx++
      })
      msg.channel.sendMessage(warns)
    })
  }, 'MANAGE_MESSAGES', '238424240032972801')
  commands.registerCommand('warn', 'Warns user for reason.', (msg,args,apx) => {
    let target = args[1].replace('<@', '').replace('>', '')
    api.addWarning(target, msg.author.id, args[2], (err) => {
      if(err){
        return apx.error('That command failed to execute. Please try again later!')
      }
      return apx.success('User has been warned successfully!')
    })
  }, 'MANAGE_MESSAGES', '238424240032972801')

  api.init(bot, (err) => { // Initialize API (create non-existent users in database)
    if(err){
      console.log(err)
      return logger.error('Failure to initialize DB API...')
    }
    console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-')
    console.log(`${bot.user.username}#${bot.user.discriminator} is now online.`)
    console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-\n\n')
    console.log('-=-=| Serving |=-=-')
    console.log(`${bot.guilds.array().length} servers`)
    console.log(`${bot.channels.array().length} channels`)
    console.log(`${bot.users.array().length} users`)
    bot.user.setStatus('dnd')
    bot.user.setGame(`Cyclone ${require('./package.json').version} | ${config.prefix}help`)
  })

})

bot.on('message', (msg) => {
  let handled = commands.handleCommand(msg)
  if(msg.channel.type === 'dm'){
    logger.serverLogMsg(msg.author, {name: '*DM*'}, msg.author, msg)
  }else{
    logger.serverLogMsg(msg.guild, msg.channel, msg.author, msg)
  }
})

bot.on('guildMemberAdd', (member) => {
  api.init(bot, (err) => {
    if(err){
      return logger.error('Failure to initialize DB API (guild member add)...')
    }
  })
  if(member.guild.id !== '238424240032972801') return
  member.guild.defaultChannel.sendMessage(`Welcome <@${member.id}> to Relativity! Please be sure to read the rules in <#242440173177012224> before chatting!`)
})

bot.on('guildMemberRemove', (member) => {
  if(member.guild.id !== '238424240032972801') return
  member.guild.defaultChannel.sendMessage(`Bye <@${member.id}>!`)
})

bot.login(config.token)