/**
 * Project............: Cyclone
 * File...............: commands.js
 * Author.............: Relative
 * Created on.........: 11/23/2016
 */

const config = require('./config.json')
module.exports.commands = {}
module.exports._api = {
  msg: null,
  error: function(message){
    return this.msg.channel.sendMessage(`:x: \`\`\`diff
-!- ERROR -!-
${message} 
-!- END ERROR -!-\`\`\``)
  },
  success: function(message){
    return this.msg.channel.sendMessage(`:white_check_mark: \`\`\`diff
+!+ SUCCESS +!+
${message} 
+!+ END SUCCESS +!+\`\`\``)
  },
  getPrefix: function(){
    if(config.servers[msg.guild.id]){
      return config.servers[msg.guild.id].prefix
    }
    return config.prefix
  }
}
module.exports.hasPermission = (msg, perm) => {
  if(perm === 'botAdmin'){
    if(msg.author.id === '116693403147698181') return true // change id - bot admin
    if(msg.author.id === '180444644650385409') return true // change id - bot admin
    return false
  }
  if(msg.author.id === '116693403147698181') return true // change id - all permissions
  let perms = msg.channel.permissionsFor(msg.author).serialize()
  return perms[perm]
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
  let prefix = config.prefix
  if(config.servers[msg.guild.id]) prefix = config.servers[msg.guild.id].prefix
  if(!(msg.content.startsWith(prefix))) return false

  let originalContent = msg.content
  let originalCleanContent = msg.cleanContent
  msg.content = msg.content.replaceAll('"', '')
  msg.cleanContent = msg.cleanContent.replaceAll('"', '')
  let args = msg.content.substr(config.prefix.length,msg.content.length)
  args = args.match(/\w+|"[^"]+"/g)
  let api = module.exports.generateApi(msg)
  let commands = module.exports.commands
  if(!commands[args[0]]){
    if(config.servers[msg.guild.id]){
      let srv = config.servers[msg.guild.id]
      if(srv.unknownMessage){
        api.error(`That command doesn't exist! Execute '${config.prefix}help' for all commands.`)
      }
    }else{
      api.error(`That command doesn't exist! Execute '${config.prefix}help' for all commands.`)
    }

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
module.exports.init = () => {
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

  return true
}
