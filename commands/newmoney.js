const sr = require('common-tags').stripIndents
const RichEmbed = require('../embed')
const colorcfg = {
  green: '#139A43',
  red: '#DA2C38',
  blue: '#256EFF',
  purple: '#5E239D',
  green2: '#0DAB76'
}
const uuidv4 = require('uuid/v4')
const crypto = require('crypto')
const randomstring = require('randomstring')
const config = require('../config')
const env = process.env.NODE_ENV
const snekfetch = require('snekfetch')
function base64(str) {
  return Buffer.from(str).toString('base64')
}

module.exports = function (bot, db, log) {
  async function registered(user) {
    let member = await db.r.table('users').get(user.id).run()
    return member.registered || false
  }
  async function getMoney(user) {
    let member = await db.r.table('users').get(user.id).run()
    return member.balance || 0
  }
  async function awardMoney(user, money) {
    let curBal = await getMoney(user)
    await db.r.table('users').get(user.id).update({
      money: curBal + money
    }).run()
  }

  let moneyCommand = bot.registerCommand('money', (msg, args) => {
    msg.channel.createMessage(`\`cy!money\` is broken. come back later!`)
  })
  moneyCommand.registerSubcommand('register', async (msg, args) => {
    let didRegister = await registered(msg.author)
    if(didRegister) {
      return `You have already registered for an account! 😦`
    }
    let user = await db.r.table('users').get(msg.author.id).run()
    await db.r.table('users').get(msg.author.id).update({
      registered: true,
      balance: 250
    }).run()
    return `You have been awarded 250 CCC for registering an account.`
  })
  moneyCommand.registerSubcommand('balance', async (msg, args) => {
    let didRegister = await registered(msg.author)
    if(!didRegister) {
      return `You have not registered for an account! Run \`cy!money register\` 😦`
    }
    let money = await getMoney(msg.author)
    return `Your balance is ${money} CCC.`
  })
  moneyCommand.registerSubcommand('discoin', async (msg, args) => {
    let discoin = config.secrets.discoin
    let res = await snekfetch.get(`http://discoin-austinhuang.rhcloud.com/transaction`)
      .set('Authorization', discoin)
    let body = JSON.parse(res.text)
    return JSON.stringify(body)
  }, {
    requirements: {
      userIDs: ['116693403147698181']
    },
  })
  log.info('Money module registered.')
}