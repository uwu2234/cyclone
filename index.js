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
const app = require('./server')
const db =  mongoose.createConnection('admin:XpCdV6K1DWwq4BW0k0l@178.32.177.169/cyclone?authSource=admin&authMechanism=SCRAM-SHA-1')
app.set('bot', bot)
const iconCodeMap = {
  'tornado': ['0', '00'],
  'tropical-storm': ['1', '01', '2', '02'],
  'thunderstorm': ['3', '03', '4', '04'],
  'rain-snow': ['5', '05', '7', '07'],
  'rain-hail': ['6', '06', '10', '35'],
  'freezing-drizzle': ['8', '08'],
  'scattered-showers': ['9', '09', '11', '39'],
  'rain': ['12'],
  'flurries': ['13'],
  'snow': ['14', '16'],
  'blowing-snow': ['15', '25'],
  'hail': ['17', '18'],
  'fog': ['19', '20', '21', '22'],
  'wind': ['23', '24'],
  'cloudy': ['26'],
  'mostly-cloudy-night': ['27'],
  'mostly-cloudy': ['28'],
  'partly-cloudy-night': ['29'],
  'partly-cloudy': ['30'],
  'clear-night': ['31'],
  'sunny': ['32', '36'],
  'mostly-clear-night': ['33'],
  'mostly-sunny': ['34'],
  'isolated-thunderstorms': ['37'],
  'scattered-thunderstorms': ['38'],
  'heavy-rain': ['40'],
  'scattered-snow': ['41'],
  'heavy-snow': ['42', '43'],
  'na': ['-', '44', 'na'],
  'scattered-showers-night': ['45'],
  'scattered-snow-night': ['46'],
  'scattered-thunderstorms-night': ['47']
}
const iconEmojiMap = {
  'tornado': ':cloud_tornado:',
  'tropical-storm': ':cyclone:',
  'thunderstorm': ':thunder_cloud_rain:',
  'rain-snow': ':cloud_rain: :snowflake:',
  'rain-hail': ':cloud_rain: *(hail)*',
  'freezing-drizzle': ':cloud_rain: *(freezing)*',
  'scattered-showers': ':white_sun_rain_cloud:',
  'rain': ':cloud_rain:',
  'flurries': ':cloud_snow:',
  'snow': ':cloud_snow:',
  'blowing-snow': ':cloud_snow: :dash:',
  'hail': '*(hail)*',
  'fog': ':fog: *(fog)*',
  'wind': ':dash:',
  'cloudy': ':cloud:',
  'mostly-cloudy-night': ':partly_sunny:',
  'mostly-cloudy': ':partly_sunny:',
  'partly-cloudy-night': ':white_sun_small_cloud:',
  'partly-cloudy': ':white_sun_small_cloud:',
  'clear-night': ':full_moon:',
  'sunny': ':sunny:',
  'mostly-clear-night': ':full_moon: :cloud: *(partly cloudy)*',
  'mostly-sunny': ':white_sun_small_cloud:',
  'isolated-thunderstorms': ':thunder_cloud_rain:',
  'scattered-thunderstorms': ':thunder_cloud_rain:',
  'heavy-rain': ':cloud_rain: *(heavy)*',
  'scattered-snow': ':cloud_snow: *(scattered)*',
  'heavy-snow': ':cloud_snow: *(heavy)*',
  'na': ':no_entry_sign: *(na)*',
  'scattered-showers-night': ':white_sun_rain_cloud:',
  'scattered-snow-night': ':cloud_snow: *(scattered)*',
  'scattered-thunderstorms-night': ':thunder_cloud_rain:'
}
function getIconName(_code){
  let code = _code.toString()
  let name
  for (let key in iconCodeMap){
    if(iconCodeMap.hasOwnProperty(key)){
      for(let i=0; i < iconCodeMap[key].length; i++){
        let kha = iconCodeMap[key]
        let id = kha[i]
        if(id==code){
          return key
        }
      }
    }
  }
  return 'na'
}

function createCommands(){
  commands.registerCommand('balance', 'Retrieve your balance', (msg,args,apx) => {
    if(typeof args[1] === 'string'){
      let target = args[1].replace('<@', '').replace('>', '')
      api.getBalance(target, (err, balance) => {
        if(err){
          return apx.error('Failed to get target\'s balance! Please try again later.')
        }
        msg.reply(`${bot.users.get(target).username}'s balance is **${balance}**!`)
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
    if(0 > toGamble){
      return apx.error(`${toGamble} is less than 0. Aborting bet.`)
    }
    api.getBalance(msg.author.id, (err, bal) => {
      if(err){
        return apx.error('Error getting your balance. Nothing has been transacted from your account.')
      }
      let curBal = bal
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
      let warns = `**Warning record for ${bot.users.get(target).username}**\n`
      let idx = 1
      warnings.forEach((warning) => {
        if(typeof warning === 'undefined' || !warning) return
        warns += api.digitsToEmoji(idx.toString()) + `${warning.reason} *by <@${warning.warner}>*\n`
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
  commands.registerCommand('clearwarnings', 'Removes all warnings from user', (msg,args,apx) => {
    let target = args[1].replace('<@', '').replace('>', '')
    api.clearWarnings(msg.author.id, (err) => {
      if(err){
        return apx.error('That command failed to execute. Please try again later!')
      }
      return apx.success('User has been cleared of warnings successfully!')
    })
  }, 'MANAGE_MESSAGES', '238424240032972801')

  commands.registerCommand('weather', '**US ONLY** Gives you the weather for your ZIP Code', (msg, args, apx) => {
    if(!args[1]){
      return apx.error(`Usage: ${apx.getPrefix()}weather <zipcode>`)
    }
    let zip = parseInt(args[1])
    if(zip.length > 5){
      return apx.error(`${zip} is not a valid US ZIP Code.`)
    }
    requestify.get(`http://wxdata.weather.com/wxdata/mobile/mobagg/${zip}:4:US.js?key=97ce49e2-cf1b-11e0-94e9-001d092f59fc`).then((res) => {
      let body = res.getBody()
      if(!body || !body[0]){
        return apx.error(`${zip} is not a valid US ZIP Code.`)
      }
      body = body[0]
      let response = `**${body.Location.city}, ${body.Location.state}**'s weather\n`
      let iconName = getIconName(body.HiradObservation.wxIcon)
      response += `${iconEmojiMap[iconName]} **${body.HiradObservation.text}**\n`
      response += `:thermometer: ${body.HiradObservation.temp.toString()}\n`
      response += ` **Feels Like** ${body.HiradObservation.feelsLike.toString()}\n`
      response += `Winds ${body.HiradObservation.wDirText} at ${body.HiradObservation.wSpeed.toString()} mph`
      msg.channel.sendMessage(response)
    })
  })

  commands.registerCommand('shutdown', 'Shutsdown bot', (msg, args, apx) => {
    bot.destroy().then(() => {
      require('child_process').exec('pm2 stop Cyclone')
    })
  }, 'botAdmin')
  commands.registerCommand('restart', 'Restarts bot', (msg, args, apx) => {
    bot.destroy().then(() => {
      require('child_process').exec('pm2 restart Cyclone')
    })
  }, 'botAdmin')

  commands.registerCommand('update', 'Updates bot', (msg, args, apx) => {
    bot.destroy().then(() => {
      require('child_process').exec('cd ~/cyclone/source && git pull', (err, stdout, stderr) => {
        if(err){
          return require('child_process').exec('pm2 restart Cyclone')
        }
        require('child_process').exec('pm2 restart Cyclone')
      })
    })
  }, 'botAdmin')
  commands.registerCommand('admin', 'Sends link to authenticate to access admin panel', (msg, args, apx) => {
    msg.channel.sendMessage('http://cyclonebot.com/auth')
  })

  commands.registerCommand('purge', 'Delete x messages in current channel.', (msg,args,apx) => {
    let limit = 15
    if(!(typeof args[1] === 'undefined')) limit = parseInt(args[1])
    msg.channel.fetchMessages({limit: limit})
    .then((messages) => msg.channel.bulkDelete(messages))
    let msgOpts = {
      embed: {
        title: '✅ Success',
        color: parseInt('FF4136', 16),
        description: `${limit.toString()} message(s) have been purged from ${msg.channel.name}
        This message will be deleted in 5 seconds.`,
        timestamp: `${new Date().toISOString()}`
      }
    }
    msg.channel.sendMessage('', msgOpts)
      .then((msg) => {
        msg.delete(5000)
      })

  }, 'MANAGE_MESSAGES')
  
  
}

bot.on('ready', () => {
  mongoose.connect('admin:XpCdV6K1DWwq4BW0k0l@178.32.177.169/cyclone?authSource=admin&authMechanism=SCRAM-SHA-1') // Initialize Mongoose
  mongoose.Promise = global.Promise
  commands.init(bot) // Initializes built in commands (!help, !eval)
  logger.init(bot) // init log to do some HAWt logging
  createCommands()
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
  if(msg.guild.id === '238424240032972801'){
    if(msg.author.id === '194960599816470529') return
    requestify.post('https://relatively-cleanspeak-api.inversoft.io/content/item/moderate', {
      content: {
        applicationId: 'd643404c-e8b6-4252-8833-461d2ee78c03',
        createInstant: (new Date).getTime(),
        location: 'Relativity',
        parts: [{
          content: msg.cleanContent,
          type: 'text'
        }],
        senderDisplayName: msg.author.username,
        senderId: '943a26c0-e6b1-4c36-9fe7-7433f69e7028'
      }
    }, 
    {
      headers: {
        'Authorization': '6366454d-1d5f-45e9-81e2-467e70300f91'
      }
    }).then((res) => {
      let body = res.getBody()
      if(body.contentAction === 'reject'){
        msg.delete().then((msg) => {
          let channel = msg.guild.channels.find('name', 'staff_logs')
          let embed = new Discord.RichEmbed()
          embed.setAuthor(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`, msg.author.avatarURL)
          embed.setColor('#FF4136')
          embed.setTitle('Message Deleted Due To Profanity')
          embed.setTimestamp(new Date())
          embed.setDescription(msg.content)
          channel.sendEmbed(embed)

          let embedx = new Discord.RichEmbed()
          embedx.setColor('#FF4136')
          embedx.setTitle('Profanity Detected')
          embedx.setTimestamp(new Date())
          embedx.setDescription('Your message was deleted due to profanity. Please try not to use profanity next time!')
          channel.sendEmbed(embedx)
        })
      }
    })
  }
})

bot.on('guildMemberAdd', (member) => {
  api.init(bot, (err) => {
    if(err){
      return logger.error('Failure to initialize DB API (guild member add)...')
    }
  })
  if(member.guild.id !== '238424240032972801') return
  member.guild.channels.get('242440173177012224').guild.sendMessage(`Welcome <@${member.id}> to Relativity! Please be sure to read the rules in <#242440173177012224> before chatting!`)
})

bot.on('guildMemberRemove', (member) => {
  if(member.guild.id !== '238424240032972801') return
  member.guild.channels.get('242440173177012224').guild.sendMessage(`Bye <@${member.id}>!`)
})

bot.on('messageDelete', (msg) => {
  if(msg.guild.id !== '238424240032972801') return
  let channel = msg.guild.channels.find('name', 'staff_logs')
  let embed = new Discord.RichEmbed()
  embed.setAuthor(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`, msg.author.avatarURL)
  embed.setColor('#FF4136')
  embed.setTitle('Message Deleted')
  embed.setTimestamp(new Date())
  embed.setDescription(msg.content)
  channel.sendEmbed(embed)
})

bot.on('guildBanAdd', (guild,user) => {
  if(guild.id !== '238424240032972801') return
  let channel = guild.channels.find('name', 'staff_logs')
  let embed = new Discord.RichEmbed()
  embed.setAuthor(`${user.username}#${user.discriminator} (${user.id})`, user.avatarURL)
  embed.setColor('#FF4136')
  embed.setTitle('Member Banned')
  embed.setTimestamp(new Date())
  embed.setDescription('This member has been banned!')
  channel.sendEmbed(embed)
})
bot.on('guildBanRemove', (guild,user) => {
  if(guild.id !== '238424240032972801') return
  let channel = guild.channels.find('name', 'staff_logs')
  let embed = new Discord.RichEmbed()
  embed.setAuthor(`${user.username}#${user.discriminator} (${user.id})`, user.avatarURL)
  embed.setColor('#2ECC40')
  embed.setTitle('Member Unbanned')
  embed.setTimestamp(new Date())
  embed.setDescription('This member has been unbanned!')
  channel.sendEmbed(embed)
})

bot.login(config.token)