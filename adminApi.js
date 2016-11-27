/**
 * Project............: Cyclone
 * File...............: adminApi
 * Author.............: Relative
 * Created on.........: 11/26/2016
 */
const Users = require('./models/user-schema')
const Guilds = require('./models/guild-schema')


module.exports.bot = null
module.exports.init = (bot) => {
  this.bot = bot
}
module.exports.findUserById = (id, callback) => {
  Users.find({
    id: id
  }).exec((err, keys) => {
    if(err){
      return callback(err)
    }
    if(!keys[0]){
      return callback("No user by that ID was found in the database.")
    }
    return callback(null, keys[0])
  })
}

module.exports.findGuildById = (id, callback) => {
  Guilds.find({
    id: id
  }).exec((err, keys) => {
    if(err){
      return callback(err)
    }
    if(!keys[0]){
      return callback("No guild by that ID was found in the database.")
    }
    return callback(null, keys[0])
  })
}
module.exports.getGuildAdmins = (guildId, callback) => {
  module.exports.findGuildById(guildId, (err, guild) => {
    if (err) {
      return callback(err)
    }
    return callback(null, guild.admins)
  })
}

module.exports.getGuildCfg = (guildId, key, callback) => {
  let sync = true
  let data = null
  module.exports.findGuildById(guildId, (err, guild) => {
    if(err){
      return console.log(err)
    }
    data = guild.config[key]
    sync = false
  })
  while(sync){ require('deasync').sleep(10) }
  return data
}

module.exports.setGuildCfg = (guildId, key, value) => {
  module.exports.findGuildById(guildId, (err, guild) => {
    if(err){
      return console.log(err)
    }
    let config = guild.config
    config[key] = value
    Guilds.update({id: guildId}, {config: config}, (err,raw) => {
      if(err){
        return console.log(err)
      }
    })
  })
}

module.exports.isUserAdmin = (guildId, userId, callback) => {
  module.exports.findGuildById(guildId, (err, guild) => {
    if(err){
      return callback(err)
    }
    let admins = guild.admins
    let _guild = module.exports.bot.guilds.find('id', guildId)
    if(_guild.ownerID == userId) return callback(null, true)
    if(admins[userId]) return callback(null, true)
    return callback(null, false)
  })
}

module.exports.setUserAdmin = (guildId, userId, admin) => {
  module.exports.getGuildAdmins(guildId, (err, admins) => {
    admins[userId] = admin
    Guilds.update({id: guildId}, {admins: admins}, (err,raw) => {
      if(err){
        console.log(err)
      }
    })
  })
}

module.exports.getGuildsUserAdmins = (userId, callback) => {
  let guildsUserAdmins = []
  Guilds.find({}).exec((err, keys) => {
    if(err){
      return callback(err)
    }
    for(let _key in keys){
      let guild = keys[_key]
      if(module.exports.bot.guilds.find('id', guild.id).ownerID == userId){
        guildsUserAdmins.push(guild.id)
        continue
      }
      if(guild.admins[userId]){
        guildsUserAdmins.push(guild.id)
      }
    }
    return callback(null, guildsUserAdmins)
  })
}