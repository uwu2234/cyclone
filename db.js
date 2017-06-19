const bluebird = require('bluebird')
const decache = require('decache')
const colors = require('colors')
const db = require('./db.json')
const redis = require('redis')
const path = require('path')
const fs = require('fs')
const util = require('util')

var config = require('./config.json')
const env = process.env.NODE_ENV.substr(0,process.env.NODE_ENV.length - 1)
if(env == 'dev') config = require('./config.dev.json')

/* modified from https://stackoverflow.com/a/6394168 */
function index(obj,i) {
  if(typeof obj[i] === 'undefined') obj[i] = {}
  return obj[i]
}
/* sort of modified from https://stackoverflow.com/a/4994244 */
function isEmpty(obj) {
  if(typeof obj === 'undefined' || obj == null) return true
  if(obj.length > 0) return false
  if(obj.length == 0) return true
  if(typeof obj !== 'object') return true
  for (var key in obj) {
    if(hasOwnProperty.call(obj, key)) return false
  }
  return true
}
/* modified from https://stackoverflow.com/a/38340730 #4 */
function setBlank(obj, val) {
  Object.keys(obj).forEach((key) => {
    //console.log(`setBlank(keys)! obj=${JSON.stringify(obj)};val=${val};key=${key};obj[key]=${JSON.stringify(obj[key])};typeof obj[key]=${typeof obj[key]};recurse?=${(obj[key] && typeof obj[key] === 'object') ? 'true' : 'false'};replace?=${isEmpty(obj[key])}`)
    if(obj[key] && typeof obj[key] === 'object' && isEmpty(obj[key]) == false) setBlank(obj[key], val)
    else if (isEmpty(obj[key])) obj[key] = val
  })
  return obj
}
class FileDatabase {
  constructor() {
    this.load()
    if(typeof this.db.servers === 'undefined') this.db.servers = {}
    if(typeof this.db.users === 'undefined') this.db.users = {}
    this.save()
  }

  validServer(guild) {
    if(typeof this.db.servers[guild] === 'undefined') this.db.servers[guild] = {}
    this.save()
    return this.db.servers[guild]
  }
  setServer(guild, obj) {
    this.db.servers[guild] = obj
    this.save()
  }
  setServerOption(guild, key, val) {
    let server = this.validServer(guild)
    let keySplit = key.split('\.')
    if(keySplit.length == 1) {
      server[keySplit[0]] = val
      this.setServer(guild, server)
    } else {
      let obj = {}
      let ks = keySplit.slice(1)
      ks.reduce(index, obj)
      let _k = keySplit[0]
      obj = setBlank(obj, val)
      if(typeof server[_k] === 'undefined') {
        this.getServerOption(guild, _k, obj)
      } else {
        let ab = server[_k]
        Object.assign(ab, obj)
        this.setServerOption(guild, _k, ab)
      }
      
    }
  }
  getServerOption(guild, key, def = undefined) {
    let server = this.validServer(guild)
    if(typeof server[key] === 'undefined') {
      if(typeof def === 'undefined') return undefined
      this.setServerOption(guild, key, def)
      return getServerOption(guild, key, def)
    } else {
      return server[key]
    }
  }

  validUser(user) {
    if(typeof this.db.users[user] === 'undefined') this.db.users[user] = {}
    this.save()
    return this.db.users[user]
  }
  setUser(user, obj) {
    this.db.users[user] = obj
    this.save()
  }
  setUserOption(member, key, val) {
    let user = this.validUser(member)
    let keySplit = key.split('\.')
    if(keySplit.length == 1) {
      user[keySplit[0]] = val
      this.setUser(member, user)
    } else {
      let obj = {}
      let ks = keySplit.slice(1)
      ks.reduce(index, obj)
      let _k = keySplit[0]
      obj = setBlank(obj, val)
      if(typeof user[_k] === 'undefined') {
        this.getUserOption(member, _k, obj)
      } else {
        let ab = user[_k]
        Object.assign(ab, obj)
        this.setUserOption(member, _k, ab)
      }
    }
    this.save()
  }
  getUserOption(member, key, def = undefined) {
    let user = this.validUser(member)
    if(typeof user[key] === 'undefined') {
      if(typeof def === 'undefined') return undefined
      this.setUserOption(member, key, def)
      return getUserOption(member, key, def)
    } else {
      return user[key]
    }
  }

  save(name = "db.json") {
    fs.writeFileSync(path.join(__dirname, name), JSON.stringify(this.db), 'utf8')
  }
  saveBackup(id = 1) {
    fs.writeFileSync(path.join(__dirname, 'db-backup', `db-bak-${id}.json`), JSON.stringify(this.db_backup), 'utf8')
  }
  load() {
    this.db_backup = this.db
    this.saveBackup(1)
    this.db = null
    decache('./db.json')
    this.db = require('./db.json')
  }
  reload() {
    this.load()
  }
  raw() {
    return this.db
  }
  recoverBackup() {
    if(this.db_backup) {
      this.save('db-beforerecover.json')
      this.saveBackup(2)
      console.log('db.db_backup found, recovering from that.')
      this.db = this.db_backup
      this.save()
      console.log('recovery should have completed. exiting to avoid database loss. please restart.')
      process.exit(0)
      return
    }
    console.log('db.db_backup not found, you may need to manually recover.')
    console.log('exiting before database loss happens.')
    process.exit(1)
    return
  }
}
function parse(arg) {
  if(arg == 'true' || arg == true) return true
  if(arg == 'false' || arg == false) return false
  return arg
}
class RedisDatabase {
  constructor(bot, log) {
    bluebird.promisifyAll(redis.RedisClient.prototype)
    bluebird.promisifyAll(redis.Multi.prototype)
    this.client = redis.createClient(`redis://:${config.redis.password}@${config.redis.host}:${config.redis.port}/${config.redis.database}`)
    this.bot = bot
    this.log = log
    this.client.on('ready', () => {
      this.log.info('Redis is ready!')
    })
    this.client.on('error', (err) => {
      this.log.error(`Redis error! ${util.inspect(err)}`)
    })
    this.init()
  }
  async init() {
    let client = this.client
  }
  async getServerOption(guild, key, def = undefined) {
    let val = await this.client.hgetAsync(guild, key)
    if(val == 'null' || val == null || val == '' && typeof def  == 'undefined') {
      this.setServerOption(guild, key, def)
      return await parse(def)
    }
    return await parse(val)
  }
  setServerOption(guild, key, val) {
    this.client.hset(guild, key, val)
  }
  async getUserOption(member, key, def = undefined) {
    let val = await this.client.hgetAsync(member, key)
    if(val == 'null' || val == null || val == '' && typeof def != 'undefined') {
      this.setUserOption(member, key, def)
      return await parse(def)
    }
    return await parse(val)
  }
  setUserOption(member, key, val) {
    this.client.hset(member, key, val)
  }
}


module.exports = {
  FileDatabase: FileDatabase,
  RedisDatabase: RedisDatabase
}