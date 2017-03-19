const Discord   = require('discord.js')

class Command {
  /**
   * @typedef {Object} CommandOptions
   * @property {string} name - Name of the command
   * @property {string} help - Help text for the command
   * @property {boolean} [guildOnly=true] - Should the command only execute in a guild channel?
   */

  /**
   * @param {CommandOptions} options - The options of the command
   */
  constructor(options) {
    if(typeof options !== 'object') throw new TypeError('Options must be an object.')
    if(typeof options.name !== 'string') throw new TypeError('Command name must be a string.')
    if(typeof options.help !== 'string') throw new TypeError('Command help must be a string')
    this.options = options
    /**
     * Name of the command
     * @type {string}
     */
    this.name = options.name

    /**
     * Help text for the command
     * @type {string}
     */
    this.help = options.help

    /**
     * Should the command only execute in a guild channel?
     * @type {boolean}
     */
    this.guildOnly = !options.guildOnly

    /**
     * Is the command loaded?
     * @type {boolean}
     */
    this.loaded = false
  }

  hasPermission(message, api) {
    return true
  }

  load() {
    this.loaded = true
  }

  unload() {
    this.loaded = false
  }

  usage() {

  }
  
  async run(message, args, api) {
    throw new Error('No run for command!')
  }
}


module.exports = Command