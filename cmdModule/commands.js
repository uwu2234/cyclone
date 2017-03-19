const parseArgs = require('./parseArgs')
const Discord   = require('discord.js')
const command   = require('./command')
const api       = require('./api')
const path      = require('path')
const fs        = require('fs')

class CommandHandler {
  /**
   * @typedef {Object} CommandHandlerOptions
   * @property {Discord.Client} bot - discord.js client
   * @property {string} prefix - Command prefix
   */

  /**
   * @param {CommandHandlerOptions} options - The options for the Commandhnadler
   */
  constructor(options) {
    if(typeof options !== 'object') throw new TypeError('Options must be an object.')
    if(!options.bot) throw new TypeError('Bot must be defined.')

    /**
     * Discord.js client
     * @type {Discord.Client}
     */
    this.bot = options.bot

    /**
     * Command prefix
     * @type {string}
     */
    this.prefix = options.prefix

    this.commands = {}
    fs.readdir(path.join(__dirname, '..', 'commands'), (err, files) => {
      if(err) throw err
      files.forEach((file) => {
        this.registerCommand(file.substr(0, file.length - 3))
      })
    })
  }
  
  /**
   * @param {string} name - The command name to register
   */
  registerCommand(name) {
    if(typeof name !== 'string') throw new TypeError('Name must be a string.')
    try {
      let cmd = require(path.join(__dirname, '..', 'commands', name +'.js'))
      this.commands[name] = new cmd()
      return this.loadCommand(name)
    } catch(err) {
      throw err
    }
  }

  /**
   * @param {string} command - Command to load
   */
  loadCommand(command) {
    if(typeof command !== 'string') throw new TypeError('Command must be a string.')
    if(!this.commands[command]) throw new Error('Command has not been registered.')
    try {
      this.commands[command].load()
      return true
    } catch(err) {
      throw err
    }
  }

  /**
   * @param {string} command - Command to unload
   */
  unloadCommand(command) {
    if(typeof command !== 'string') throw new TypeError('Command must be a string.')
    if(!this.commands[command]) throw new Error('Command has not been registered.')
    if(!this.commands[command].loaded) throw new Error('Command is not loaded.')
    try {
      this.commands[command].unload()
      this.commands[command] = null
      let reqPath = path.join(__dirname, '..', 'commands', command+'.js')
      delete require.cache[reqPath]
      let cmd = require(reqPath)
      this.commands[command] = new cmd()
      return true
    } catch(err) {
      throw err
    }
  }



  /**
   * @param {string} command - Command to reload
   */
  reloadCommand(command) {
    if(typeof command !== 'string') throw new TypeError('Command must be a string.')
    if(!this.commands[command]) throw new Error('Command has not been registered.')
    try {
      this.unloadCommand(command)
      this.loadCommand(command)
      return true
    } catch(err) {
      throw err
    }
  }

  /**
   * @param {Discord.Message} message - Message to handle
   */
  handleMessage(message) {
    if(!message) throw new TypeError('Message must be a Message.')
    try {
      let prefix = this.prefix
      let content = message.content
      if(!content.startsWith(prefix)) return false
      let args = parseArgs(content)
      if(!this.commands[args[0]]) return false
      let command = this.commands[args[0]]
      if(command.loaded == false) return false
      let _api = new api(message, args, this)
      if(command.hasPermission(message, _api)) {
        command.run(message, args, new api(message, args, this))
        return true
      } else {
        let apx = new api(message, args, this)
        return apx.error('You do not have permission to execute that command!')
      }
    } catch(err) {
      throw err
    }
  }
}

module.exports = {
  CommandHandler: CommandHandler,
  CommandApi: api,
  Command: command
}