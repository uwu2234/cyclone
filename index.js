/**
 * Project............: Cyclone
 * File...............: index.js
 * Author.............: Relative
 * Created on.........: 11/23/2016
 */
const Discord = require('discord.js')
const mongoose = require('mongoose')
const requestify = require('requestify')
const CmdHandle = require('./cmdModule/commands')

const config = require('./config.json')
const commands = require('./commands')
const logger = require('./log')
const api = require('./api')

const bot = new Discord.Client()
const app = require('./server')
const db =  mongoose.createConnection('admin:LhBWu6K2yo@69.195.152.138/cyclone?authSource=admin&authMechanism=SCRAM-SHA-1')
let profanity = {}
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

const handler = new CmdHandle.CommandHandler({
  bot: bot,
  prefix: '!'
})

bot.on('ready', () => {
  mongoose.Promise = global.Promise
  mongoose.connect('admin:LhBWu6K2yo@69.195.152.138/cyclone?authSource=admin&authMechanism=SCRAM-SHA-1') // Initialize Mongoose
  logger.init(bot) // init log to do some HAWt logging
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
    bot.user.setGame(`Cyclone ${require('./package.json').version} | ${config.prefix}help`, 'http://twitch.tv/directory')
  })
})

bot.on('message', (msg) => {
  handler.handleMessage(msg)
  //let handled = commands.handleCommand(msg)
  if(msg.channel.type === 'dm'){
    logger.serverLogMsg(msg.author, {name: '*DM*'}, msg.author, msg)
  }else{
    logger.serverLogMsg(msg.guild, msg.channel, msg.author, msg)
  }
  /*if(!msg.channel.type === 'dm' && msg.guild.id === '238424240032972801'){
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
          msg.channel.sendEmbed(embedx)
          profanity[msg.id] = true
        })
      }
    })
  }*/

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
  if(profanity[msg.id] == true) return
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