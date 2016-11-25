/**
 * Project............: Cyclone
 * File...............: index.js
 * Author.............: Relative
 * Created on.........: 11/23/2016
 */
const Discord = require('discord.js')
const mongoose = require('mongoose')
const requestify = require('requestify')

const config = require('./config.json')
const commands = require('./commands')
const logger = require('./log')
const api = require('./api')

const bot = new Discord.Client()
const messages = {
  win: [
    ":white_check_mark: You won $WIN$! Congratulations!"
  ],
  lose: [
    ":bomb: BANG YOUR DEAD! YOU LOST $WIN$! FAILURE!"
  ]
}
bot.on('ready', () => {
  mongoose.connect('admin:XpCdV6K1DWwq4BW0k0l@178.32.177.169/cyclone?authSource=admin&authMechanism=SCRAM-SHA-1') // Initialize Mongoose
  mongoose.Promise = global.Promise
  commands.init() // Initializes built in commands (!help, !eval)

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
  commands.registerCommand('bet', 'Bet your balance and probably lose', (msg,args,apx) => {
    if(!args[1]){
      return apx.error(`Usage: ${apx.getPrefix()}bet <money>`)
    }
    let toGamble = parseInt(args[1])
    let curBal = api.getBalance(msg.author.id, (err, bal) => {
      if(err){
        return apx.error('Error getting your balance. Nothing has been transacted from your account.')
      }
      if(toGamble > curBal){
        return apx.error('You do not have enough money to bet on that. Nothing has been transacted from your account.')
      }
      api.subtractBalance(msg.author.id, toGamble, (err) => {
        if(err){
          return apx.error('Error subtracting gamble from your balance. Nothing has been transacted from your account.')
        }
        let rdm = Math.floor(Math.random()*(100)+1)
        let moneyToGive = 0
        if(rdm <= 1){
          moneyToGive = toGamble*10
          api.addBalance(msg.author.id, moneyToGive, (err) => {
            if(err){
              return apx.error(`Error giving you your money. Please show @Relative#1027 this message with the amount: ${toGamble} ${moneyToGive}`)
            }
            msg.channel.sendMessage(`:white_check_mark: :moneybag: You have won **$${moneyToGive}**! Your lucky number is ${rdm}. Check your balance with ${apx.getPrefix()}balance`)
          })
        }else if(rdm <= 42){
          msg.channel.sendMessage(`:x: :bomb: You have lost **$${toGamble}**! Your unlucky number is ${rdm}. Check your balance with ${apx.getPrefix()}balance`)
        }else if(rdm <= 52){
          moneyToGive = toGamble*2
          api.addBalance(msg.author.id, moneyToGive, (err) => {
            if(err){
              return apx.error(`Error giving you your money. Please show @Relative#1027 this message with the amount: ${toGamble} ${moneyToGive}`)
            }
            msg.channel.sendMessage(`:white_check_mark: :moneybag: You have won **$${moneyToGive}**! Your lucky number is ${rdm}. Check your balance with ${apx.getPrefix()}balance`)
          })
        }else if(rdm <= 76){
          msg.channel.sendMessage(`:x: :bomb: You have lost **$${toGamble}**! Your unlucky number is ${rdm}. Check your balance with ${apx.getPrefix()}balance`)
        }else if(rdm == 77){
          moneyToGive = toGamble*12
          api.addBalance(msg.author.id, moneyToGive, (err) => {
            if(err){
              return apx.error(`Error giving you your money. Please show @Relative#1027 this message with the amount: ${toGamble} ${moneyToGive}`)
            }
            msg.channel.sendMessage(`:white_check_mark: :money_mouth: You have won **$${moneyToGive}**!!! Your lucky number is ${rdm}. Check your balance with ${apx.getPrefix()}balance`)
          })
        }else if(rdm <= 86) {
          moneyToGive = toGamble * 3
          api.addBalance(msg.author.id, moneyToGive, (err) => {
            if (err) {
              return apx.error(`Error giving you your money. Please show @Relative#1027 this message with the amount: ${toGamble} ${moneyToGive}`)
            }
            msg.channel.sendMessage(`:white_check_mark: :moneybag: You have won **$${moneyToGive}**! Your lucky number is ${rdm}. Check your balance with ${apx.getPrefix()}balance`)
          })
        }else if(rdm <= 99){
          msg.channel.sendMessage(`:x: :bomb: You have lost **$${toGamble}**! Your unlucky number is ${rdm}. Check your balance with ${apx.getPrefix()}balance`)
        }else if(rdm == 100){
          moneyToGive = toGamble * 6
          api.addBalance(msg.author.id, moneyToGive, (err) => {
            if (err) {
              return apx.error(`Error giving you your money. Please show @Relative#1027 this message with the amount: ${toGamble} ${moneyToGive}`)
            }
            msg.channel.sendMessage(`:white_check_mark: :moneybag: You have won **$${moneyToGive}**! Your lucky number is ${rdm}. Check your balance with ${apx.getPrefix()}balance`)
          })
        }else{
          moneyToGive = toGamble * 500
          api.addBalance(msg.author.id, moneyToGive, (err) => {
            if (err) {
              return apx.error(`Error giving you your money. (ha x500 lost!!!11!1) Please show @Relative#1027 this message with the amount: ${toGamble} ${moneyToGive}`)
            }
            msg.channel.sendMessage(`:white_check_mark: :moneybag: You have won **$${moneyToGive}**! (x500). Your **EXTREMELY LUCKY** number is ${rdm}. You have won against all odds due to a programming flaw. Please enjoy the free money. Check your balance with ${apx.getPrefix()}balance`)
          })
        }
      })
    })
  })
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
  commands.registerCommand('eval', 'Runs javascript code on the bot', (msg, args, apx)=>{
    try{
      var code = msg.content.substr(5);
      var resp = eval(code);
      api.success('Your code successfully ran on the bot!')
      msg.channel.sendMessage(`\`\`\`${resp}\`\`\``);
    }catch(ex){
      api.error('Your code failed to run on the bot. Stack trace is below.')
      msg.channel.sendMessage(`\`\`\`${ex}\`\`\``);
    }
  }, 'botAdmin');
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

bot.on('messageDelete', (msg) => {
  if(msg.guild.id !== '238424240032972801') return
  requestify.post(config.webhook, logger.generateMessageDelete(msg))
})

bot.on('guildBanAdd', (guild,user) => {
  if(guild.id !== '238424240032972801') return
  requestify.post(config.webhook, logger.generateUserBanned(guild,user))
})

bot.on('guildBanRemove', (guild,user) => {
  if(guild.id !== '238424240032972801') return
  requestify.post(config.webhook, logger.generateUserUnbanned(guild,user))
})

bot.login(config.token)