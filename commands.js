/**
 * Project............: Cyclone
 * File...............: commands.js
 * Author.............: Relative
 * Created on.........: 11/23/2016
 */

const config = require('./config.json')
module.exports.commands = {}
module.exports.api = {
  msg: null,
  error: (message) => {
    return this.msg.channel.sendMessage(`:x: \`\`\`diff
-!- ERROR -!-
${message} 
-!- END ERROR -!-\`\`\``)
  },
  success: (message) => {
    return this.msg.channel.sendMessage(`:white_check_mark: \`\`\`diff
+!+ SUCCESS +!+
${message} 
+!+ END SUCCESS +!+\`\`\``)
  }
}
module.exports.hasPermission = (msg, perm) => {
  if(msg.author.id === '116693403147698181') return true
  let perms = msg.channel.permissionsFor(msg.author).serialize()
  return perms[perm]
}

module.exports.registerCommand = (name, help, callback, permission) => {
  let _cmd = {
    "help": help,
    "callback": callback
  }
  if(permission) _cmd.permission = permission
  module.exports.commands[name] = _cmd
}
module.exports.generateApi = (msg) => {
  let api = module.exports.api
  api.msg = msg
  return api
}
module.exports.handleCommand = (msg) => {
  if(!(msg.cleanContent.startsWith(config.prefix))) return
  let args = msg.cleanContent.substr(config.prefix.length,msg.cleanContent.length)
  args = args.match(/\w+|"[^"]+"/g)
  let api = module.exports.generateApi(msg)
  let commands = module.exports.commands
  if(!commands[args[0]]){
    api.error(`That command doesn't exist! Execute '${config.prefix}help' for all commands.`)
    return false // Not handled. Returns false for handling.
  }
  let cmd = commands[args[0]]
  if(cmd.permission){
    if(!module.exports.hasPermission(msg, cmd.permission)){
      api.error(`You do not have permission to execute that command!`)
      return true // Handled, but no permission.
    }
    cmd.callback(msg, args, api) // Handled and executed.
  }
  cmd.callback(msg, args, api)
  return true // Handled and executed.
}
module.exports.init = () => {
  module.exports.registerCommand('help', 'Shows help of every command', (msg, args) => {
    let commands = module.exports.commands
    let helpText = `Cyclone v${require('./package.json').version} - developed by <@116693403147698181> \n\`\`\``
    for(let _cmd in commands){
      if(!commands.hasOwnProperty(key)) continue
      let cmd = commands[_cmd]
      if(module.exports.hasPermission(msg, cmd.permission))
      helpText += `${config.prefix}${cmd}: ${commands[cmd].help}`
    }
    helpText += '```'
    msg.author.sendMessage(helpText)
    msg.channel.sendMessage(':mailbox_with_mail: Check your PMs!')
  })
  return true
}
