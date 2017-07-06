const config = require('./config.json')
const r = require('rethinkdbdash')({
  host: config.rethink.host,
  port: config.rethink.port,
  user: config.rethink.user,
  password: config.rethink.password,
  db: config.rethink.db,
  pool: true
})
class Database {
  constructor() {
    this.r = r
  }
  setClient(bot) {
    this.bot = bot
  }
  async makeServer(id) {
    return await this.r.table('servers').insert({
      id: id,
      admins: [],
      blacklisted: false,
      config: {},
      premium: false
    }).run()
  }
  async makeUser(id) {
    return await this.r.table('users').insert({
      id: id,
      balance: 0,
      blacklisted: false,
      config: {},
      nonce: '',
      userSeed: ''
    }).run()
  }
  async checkServer(guild) {
    let server = await this.r.table('servers').get(guild.id).run()
    if(!server) {
      return await this.makeServer(guild.id)
    }
  }
  async checkUser(user) {
    let member = await this.r.table('users').get(user.id).run()
    if(!member) {
      return await this.makeUser(user.id)
    }
  }

  async getUser(user) {
    await this.checkUser(user)
    let member = await this.r.table('users').get(user.id).run()
    return member
  }
  async getServer(guild) {
    await this.checkServer(guild)
    let server = await this.r.table('servers').get(guild.id).run()
    return server
  }
  
}
module.exports = Database
