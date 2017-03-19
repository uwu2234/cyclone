const Discord   = require('discord.js')


class CommandApi {
  /**
   * @param {Discord.Message} message - Message to use when creating command API
   * @param {string[]} args - Arguments
   */
  constructor(message, args, handler) {
    if(!message) throw new TypeError('Message must be a Message.')
    if(!args || !Array.isArray(args)) throw new TypeError('Args must be an array.')

    this.message = message
    this.args = args

    /**
     * User that executed command
     * @type {Discord.User}
     */
    this.user = message.author

    /**
     * Command handler
     * @type {CommandHandler}
     */
    this.handler = handler

    if(message.channel.type !== 'dm'){
      /**
       * GuildMember that executed command
       * @type {Discord.GuildMember}
       */
      this.member = message.member
    } 
  }

  /**
   * @param {string} message - Error message
   */
  error(message) {
    try {
      let embed = new Discord.RichEmbed()
      embed.setTitle('🚫 Error')
      embed.setDescription(message)
      embed.setColor('#FF4136')
      embed.setTimestamp(new Date())
      this.message.channel.sendEmbed(embed)
      return true
    } catch(err) {
      return err
    }
  }

  /**
   * @param {string} message - Success message
   */
  success(message) {
    try {
      let embed = new Discord.RichEmbed()
      embed.setTitle('✅ Success')
      embed.setDescription(message)
      embed.setColor('#2ECC40')
      embed.setTimestamp(new Date())
      this.message.channel.sendEmbed(embed)
      return true
    } catch(err) {
      return err
    }
  }

  /**
   * @param {User} user - User to get rank of
   */
  getRank(user) {
    let cycloneGuild = this.handler.bot.guilds.get('257307356541485066')
    if(cycloneGuild.members.find(user.id)){
      let member = cycloneGuild.members.find(user.id)
      if(member.roles.get('257307403580735498')) return 'botAdmin'
      if(member.roles.get('257307453966909440')) return 'botMod'
      if(member.roles.get('257307903034130452')) return 'botStaff'
      return false
    }
    return false
  }
}


module.exports = CommandApi