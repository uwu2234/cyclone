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
const moment = require('moment')
function base64(str) {
  return Buffer.from(str).toString('base64')
}

const API_BASE = 'http://discoin-austinhuang.rhcloud.com'

module.exports = function (bot, db, log) {
  async function registered(user) {
    let member = await db.r.table('users').get(user.id).run()
    return member.registered || false
  }
  async function getMoney(user) {
    let member = await db.r.table('users').get(user.id).run()
    return member.balance || 0
  }
  async function getIdMoney(user) {
    let member = await db.r.table('users').get(user).run()
    return member.balance || 0
  }
  async function awardMoney(user, money) {
    let curBal = await getMoney(user)
    await db.r.table('users').get(user.id).update({
      balance: curBal + parseInt(money)
    }).run()
  }
  async function awardIdMoney(user, money) {
    let curBal = await getIdMoney(user)
    await db.r.table('users').get(user).update({
      balance: curBal + parseInt(money)
    }).run()
  }
  async function takeMoney(user, money) {
    let curBal = await getMoney(user)
    await db.r.table('users').get(user.id).update({
      balance: curBal - parseInt(money)
    }).run()
  }
  let moneyCommand = bot.registerCommand('money', (msg, args) => {
    msg.channel.createMessage(`\`cy!money [register|balance|exchange|daily]\``)
  }, {
    aliases: ['$', '$$$', 'cash', 'bal'],
    description: 'Have fun with money!'
  })
  moneyCommand.registerSubcommand('register', async (msg, args) => {
    let didRegister = await registered(msg.author)
    if(didRegister) {
      return `You have already registered for an account! 😦`
    }
    let user = await db.r.table('users').get(msg.author.id).run()
    await db.r.table('users').get(msg.author.id).update({
      registered: true
    }).run()
    await awardMoney(msg.author, 250)
    return `You have been awarded 250 CCC for registering an account.`
  }, {
    description: 'Register for a CycloneCoins account'
  })
  moneyCommand.registerSubcommand('balance', async (msg, args) => {
    let didRegister = await registered(msg.author)
    if(!didRegister) {
      return `You have not registered for an account! Run \`cy!money register\` 😦`
    }
    let money = await getMoney(msg.author)
    return `Your balance is ${money} CCC.`
  }, {
    aliases: ['$', '$$$', 'bal', 'money'],
    description: 'Get your balance'
  })
  moneyCommand.registerSubcommand('daily', async (msg, args) => {
    let didRegister = await registered(msg.author)
    if(!didRegister) {
      return `You have not registered for an account! Run \`cy!money register\` 😦`
    }
    let _lastDaily = await db.r.table('users').get(msg.author.id).run()
    let lastDaily = _lastDaily.lastDaily
    let now = moment()
    if(!lastDaily) {
      await db.r.table('users').get(msg.author.id).update({lastDaily: (now.unix() * 1000)}).run()
      await awardMoney(msg.author, 100)
      return 'You have been awarded 100 CCC as a daily reward.'
    } else {
      let dt = moment(lastDaily)
      let x = dt.add(1, 'day')
      if(now.unix() > x.unix()) {
        await db.r.table('users').get(msg.author.id).update({lastDaily: (now.unix() * 1000)}).run()
        await awardMoney(msg.author, 100)
        return 'You have received 100 CCC as a daily reward.'
      } else {
        return `You must wait before getting your daily reward. **${x.fromNow()}** you can receive your daily reward again.`
      }
    }
  }, {
    description: 'Get your daily bonus of CyloneCoins'
  })
  moneyCommand.registerSubcommand('flip', async (msg, args) => {
    let balance = await getMoney(msg.author)
    
    let amount = parseInt(args[0])
    let headsTails = args[1]
    if(isNaN(amount) || amount < 2 || !parseInt(amount)) {
      return sr`${amount < 2 ? "You can't input an amount thats less than 2. Try again." : 'Please enter a valid amount.'}
      **Usage**: cy!money flip <amount> <heads/tails>
      **Example**: cy!money flip 50 heads`
    }
    if(!headsTails || !(headsTails.toLowerCase().substr(0, 1) == 'h' || headsTails.toLowerCase().substr(0, 1) == 't')) {
      return sr`Please enter a valid choice for heads or tails.
      **Usage**: cy!money flip <amount> <heads/tails>
      **Example**: cy!money flip 50 heads`
    }
    headsTails = headsTails.toLowerCase().substr(0,1) == 'h' ? true : false

    if(amount > balance) {
      return sr`You do not have enough CCC! Your current balance is **${balance}** CCC.
      **Usage**: cy!money flip <amount> <heads/tails>
      **Example**: cy!money flip 50 heads`
    }

    await takeMoney(msg.author, amount)
    let res = Math.random() > 0.5
    let embed = new RichEmbed()
    embed.setTitle('💵 `Money`')
    embed.setErisAuthor(msg.author)
    embed.setTimestamp()
    let won = 0
    if(res == true) { // heads
      if(headsTails == true) {
        won = amount * 1.4
        embed.setDescription(`You won **${amount * 0.4}** CCC!`)
        embed.setColor(colorcfg.green)
      } else {
        embed.setDescription(`You lost **${amount}** CCC!`)
        embed.setColor(colorcfg.red)
      }
    } else { // Tails
      if(headsTails == false) {
        won = amount * 1.5
        embed.setDescription(`You won **${amount * 0.5}** CCC!`)
        embed.setColor(colorcfg.green)
      } else {
        embed.setDescription(`You lost **${amount}** CCC!`)
        embed.setColor(colorcfg.red)
      }
    }
    if(won > 0) {
      await awardMoney(msg.author, won)
    }
    return {embed}
  })
  moneyCommand.registerSubcommand('exchange', async (msg, args) => {
    let didRegister = await registered(msg.author)
    if(!didRegister) {
      return `You have not registered for an account! Run \`cy!money register\` 😦`
    }
    
    let amt = args[0]
    let code = args[1]
    let bal = await getMoney(msg.author)
    if(isNaN(amt)) {
      return `Please enter a valid amount.`
    }
    if(amt > bal) {
      return `You don't have enough CCC to make this transaction!`
    }
    await takeMoney(msg.author, amt)
    let res = await snekfetch.get(`${API_BASE}/transaction/${msg.author.id}/${amt}/${code}`)
      .set('Authorization', config.secrets.discoin)
    return res.text
  })
  moneyCommand.registerSubcommand('discoin', async (msg, args) => {
    let discoin = config.secrets.discoin
    let res = await snekfetch.get(`http://discoin-austinhuang.rhcloud.com/transaction`)
      .set('Authorization', discoin)
    let body = JSON.parse(res.text)
    let buf = ''
    for(let _obj in body){
      if(!body.hasOwnProperty(_obj)) continue
      let obj = body[_obj]
      let id = obj.user
      let user = bot.users.get(id)
      let amount = obj.amount
      awardIdMoney(id, amount)
      let dmchan = await bot.getDMChannel(id)
      dmchan.createMessage(`You have received **${amount} CCC** from a discoin exchange!`)
      buf += `${user.username}#${user.discriminator} - ${amount} CCC - ${obj.id}\n`
    }
    return buf || '*No pending transactions*'
  }, {
    requirements: {
      userIDs: ['116693403147698181']
    },
  })
  log.info('Money module registered.')
}