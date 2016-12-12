/**
 * Project............: Cyclone
 * File...............: commands.js
 * Author.............: Relative
 * Created on.........: 11/23/2016
 */

const config = require('./config.json')
const adminApi = require('./adminApi')
const logger = require('./log')

module.exports.commands = {}
module.exports._api = {
  msg: null,
  error: function(message){
    return logger.newEmbed(this.msg.channel, '🚫 Error', message, '#FF4136')
  },
  success: function(message){
    return logger.newEmbed(this.msg.channel, '✅ Success', message, '#2ECC40')
  },
  getPrefix: function(){
    if(this.msg.guild.id == "250758716108963840"){
      return "*"
    }
    return "!"
    //return adminApi.getGuildCfg(this.msg.guild.id, 'prefix')
  }
}
module.exports.hasPermission = (msg, perm) => {
  if(perm === 'maintainer'){
    if(config.staff.maintainer === msg.author.id) return true
    return false
  }
  if(perm === 'botAdmin'){
    if(config.staff.admins[msg.author.id] == true) return true
    return false
  }
  if(perm === 'botMod'){
    if(config.staff.admins[msg.author.id] == true) return true
    if(config.staff.mods[msg.author.id] == true) return true
    return false
  }
  if(config.staff.maintainer === msg.author.id) return true // change id - all permissions
  let hasPerm = false
  let sync = true
  adminApi.isUserAdmin(msg.guild.id, msg.author.id, (err, admin) => {
    if(err){
      let perms = msg.channel.permissionsFor(msg.author).serialize()
      hasPerm = perms[perm]
      sync = false
      return perms[perm]
    }
    if(admin){
      hasPerm = true
      sync = false
      return true
    }else{
      let perms = msg.channel.permissionsFor(msg.author).serialize()
      hasPerm = perms[perm]
      sync = false
      return perms[perm]
    }
  })
  while(sync){ require('deasync').sleep(10) }
  return hasPerm
}

module.exports.registerCommand = (name, help, callback, permission, serverBlock) => {
  let _cmd = {
    "help": help,
    "callback": callback
  }
  if(permission) _cmd.permission = permission
  if(serverBlock) _cmd.serverBlock = serverBlock
  module.exports.commands[name] = _cmd
}
module.exports.generateApi = (msg) => {
  let api = module.exports._api
  api.msg = msg
  return api
}
String.prototype.replaceAll = function(target, replacement) {
  return this.split(target).join(replacement);
}
module.exports.handleCommand = (msg) => {
  if(msg.channel.type === 'dm') return
  //let prefix = adminApi.getGuildCfg(msg.guild.id, 'prefix')
  let prefix = module.exports.generateApi(msg).getPrefix()
  if(!(msg.content.startsWith(prefix))) return false
  let originalContent = msg.content
  let originalCleanContent = msg.cleanContent
  let args = msg.content.substr(prefix.length,msg.content.length)
  args = args.match(/\w+|"[^"]+"/g)
  for(let arg in args){
    args[arg] = args[arg].replaceAll('"', '')
  }
  let api = module.exports.generateApi(msg)
  let commands = module.exports.commands
  if(!commands[args[0]]){
    return false // Not handled. Returns false for handling.
  }
  let cmd = commands[args[0]]
  if(cmd.serverBlock){
    if(msg.guild.id !== cmd.serverBlock){
      return api.error(`That command has a server block on it! You may not execute it on "${msg.guild.name}"!`)
    }
  }
  if(cmd.permission){
    if(!module.exports.hasPermission(msg, cmd.permission)){
      api.error(`You do not have permission to execute that command!`)
      return true // Handled, but no permission.
    }
    cmd.callback(msg, args, module.exports.generateApi(msg)) // Handled and executed.
  }else{
    cmd.callback(msg, args, module.exports.generateApi(msg))
  }

  return true // Handled and executed.
}
module.exports.init = (bot) => {
  adminApi.init(bot)
  logger.init(bot)
  module.exports.registerCommand('help', 'Shows help of every command', (msg, args, api) => {
    let commands = module.exports.commands
    let helpText = `Cyclone v${require('./package.json').version} - developed by <@116693403147698181> \n\`\`\``
    for(let _cmd in commands){
      if(!commands.hasOwnProperty(_cmd)) continue
      let cmd = commands[_cmd]
      if(cmd.permission){
        if(module.exports.hasPermission(msg, cmd.permission)){
          helpText += `${api.getPrefix()}${_cmd}: ${cmd.help} [${cmd.permission}]\n`
        }
      }else{
        helpText += `${api.getPrefix()}${_cmd}: ${cmd.help}\n`
      }
    }
    helpText += '```'
    msg.author.sendMessage(helpText)
    msg.channel.sendMessage(':mailbox_with_mail: Check your PMs!')
  })
  module.exports.registerCommand('about', 'About the bot and its author', (msg,args,apx) => {
    let channel = msg.channel
    channel.sendMessage(`Cyclone v${require('./package.json').version} - developed by @Relative#1027
For help (on this server) type: \`\`${apx.getPrefix()}help\`\`
Official website: http://cyclonebot.com`)
  })
  module.exports.registerCommand('ping', 'Ping bot', (msg, args, apx) => {
    msg.channel.sendMessage(`**PONG**
Cyclone v${require('./package.json').version} - developed by @Relative#1027`)
  })

  module.exports.registerCommand('eval', 'Runs javascript code on the bot', (msg, args, apx)=>{
    try{
      let code = msg.content.substr(5);
      let resp = eval(code);
      apx.success('Your code successfully ran on the bot!')
      msg.channel.sendMessage(`\`\`\`${resp}\`\`\``);
    }catch(ex){
      apx.error('Your code failed to run on the bot. Stack trace is below.')
      msg.channel.sendMessage(`\`\`\`${ex}\`\`\``);
    }
  }, 'botAdmin')

module.exports.registerCommand('staff', 'Shows staff on server', (msg, args, apx) => {
    let guild = msg.guild
    let statusOnline = '<:statusOnline:252280901864521728>'
    let statusIdle = '<:statusIdle:252280947213336576>'
    let statusDnd = '<:statusDnd:252280963629842434>'
    let statusOffline = '<:statusOffline:252280926522966037>'
    let ownerRole = guild.roles.get('238424390331662336')
    let srAdminRole = guild.roles.get('238426963448954880')
    let adminRole = guild.roles.get('238427061402861569')
    let modRole = guild.roles.get('238427678980440065')
    let helperRole = guild.roles.get('238427643429519360')
    let response = '**OWNERS**\n'

    for(let _staff in ownerRole.members.array()){
      if(!ownerRole.members.array().hasOwnProperty(_staff)) continue
      let staff = ownerRole.members.array()[_staff]
      let user = staff.user
      let presence = user.presence
      let status = statusOnline
      if(presence.status == "online"){
        status = statusOnline
      }else if(presence.status == "offline"){
        status = statusOffline
      }else if(presence.status == "idle"){
        status = statusIdle
      }else if(presence.status == "dnd"){
        status = statusDnd
      }
      let usdis = `${status} ${user.username}#${user.discriminator}\n`
      response += usdis
    }
    response += "**SR ADMINS**\n"
    for(let _staff in srAdminRole.members.array()){
      if(!srAdminRole.members.array().hasOwnProperty(_staff)) continue
      let staff = srAdminRole.members.array()[_staff]
      let user = staff.user
      let presence = user.presence
      let status = statusOnline
      if(presence.status == "online"){
        status = statusOnline
      }else if(presence.status == "offline"){
        status = statusOffline
      }else if(presence.status == "idle"){
        status = statusIdle
      }else if(presence.status == "dnd"){
        status = statusDnd
      }
      let usdis = `${status} ${user.username}#${user.discriminator}\n`
      response += usdis
    }
    response += "**ADMINS**\n"
    for(let _staff in adminRole.members.array()){
      if(!adminRole.members.array().hasOwnProperty(_staff)) continue
      let staff = adminRole.members.array()[_staff]
      let user = staff.user
      let presence = user.presence
      let status = statusOnline
      if(presence.status == "online"){
        status = statusOnline
      }else if(presence.status == "offline"){
        status = statusOffline
      }else if(presence.status == "idle"){
        status = statusIdle
      }else if(presence.status == "dnd"){
        status = statusDnd
      }
      let usdis = `${status} ${user.username}#${user.discriminator}\n`
      response += usdis
    }
    response += "**MODS**\n"
    for(let _staff in modRole.members.array()){
      if(!modRole.members.array().hasOwnProperty(_staff)) continue
      let staff = modRole.members.array()[_staff]
      let user = staff.user
      let presence = user.presence
      let status = statusOnline
      if(presence.status == "online"){
        status = statusOnline
      }else if(presence.status == "offline"){
        status = statusOffline
      }else if(presence.status == "idle"){
        status = statusIdle
      }else if(presence.status == "dnd"){
        status = statusDnd
      }
      let usdis = `${status} ${user.username}#${user.discriminator}\n`
      response += usdis
    }
    response += "**HELPERS**\n"
    for(let _staff in helperRole.members.array()){
      if(!helperRole.members.array().hasOwnProperty(_staff)) continue
      let staff = helperRole.members.array()[_staff]
      let user = staff.user
      let presence = user.presence
      let status = statusOnline
      if(presence.status == "online"){
        status = statusOnline
      }else if(presence.status == "offline"){
        status = statusOffline
      }else if(presence.status == "idle"){
        status = statusIdle
      }else if(presence.status == "dnd"){
        status = statusDnd
      }
      let usdis = `${status} ${user.username}#${user.discriminator}\n`
      response += usdis
    }
    logger.newEmbed(msg.channel, "Staff", response, "#0074D9")
  }, 'SEND_MESSAGES', '238424240032972801')
  module.exports.registerCommand('ping', 'Ping bot', (msg,args,apx) => {
    let version = require('./package.json').version
    msg.channel.sendMessage(`Cyclone v${version} developed by @Relative#1027
Production: ${config.production.toString()}`)
  })
  module.exports.registerCommand('serverinfo', 'Server information', (msg,args,apx) => {
    let guild = msg.guild
    logger.newEmbed(msg.channel, 'Server Info', `**Name** ${guild.name}
**ID** ${guild.id}
**Channel Count** ${guild.channels.array().length}
**Icon** ${guild.iconURL}
**Owner** ${guild.owner.user.username}#${guild.owner.user.discriminator}
**Region** ${guild.region}
**Features** ${JSON.stringify(guild.features)}`, '#39CCCC')
  })
  module.exports.registerCommand('userinfo', 'User information', (msg,args,apx) => {
    let target = msg.author
    let guildTarget = msg.guild.members.get(msg.author.id)
    let statusOnline = '<:statusOnline:252280901864521728> Online'
    let statusIdle = '<:statusIdle:252280947213336576> Away'
    let statusDnd = '<:statusDnd:252280963629842434> Do Not Disturb'
    let statusOffline = '<:statusOffline:252280926522966037> Offline'
    if(args[1]){
      target = msg.client.users.get(args[1].replace('<@', '').replace('>', ''))
      guildTarget = msg.guild.members.get(args[1].replace('<@', '').replace('>', ''))
    }
    let game = "*nothing*"
    let status = statusOnline
    let nick = "*none*"
    let presence = target.presence
    if(presence.game){
      game = presence.game.name
    }
    if(guildTarget.nickname){
      nick = guildTarget.nickname
    }
    if(presence.status == "online"){
      status = statusOnline
    }else if(presence.status == "offline"){
      status = statusOffline
    }else if(presence.status == "idle"){
      status = statusIdle
    }else if(presence.status == "dnd"){
      status = statusDnd
    }
    logger.newEmbed(msg.channel, 'User Info', `**Name** ${target.username}
**Discriminator** ${target.discriminator}
**Avatar** ${target.avatarURL}
**Nickname** ${nick}
**ID** ${target.id}
**Joined At** ${guildTarget.joinedAt.toUTCString()}
**Presence**
 **- Game** ${game}
 **- Status** ${status}
**Voice**
 **- Client Deaf** ${guildTarget.selfDeaf}
 **- Client Mute** ${guildTarget.selfMute}
 **- Server Deaf** ${guildTarget.serverDeaf}
 **- Server Mute** ${guildTarget.serverMute}
**Permissions**
${JSON.stringify(guildTarget.permissions.serialize(), null, 2)}`, '#39CCCC')
  })

  return true
}
