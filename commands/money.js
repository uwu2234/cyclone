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
function base64(str) {
  return Buffer.from(str).toString('base64')
}

module.exports = function (bot, db, log) {
  function getMoney(user) {
    return db.getUserOption(user.id, 'balance')
  }
  function takeMoney(user, amount) {
    let money = getMoney(user)
    db.setUserOption(user.id, 'balance', parseInt(money) - amount)
  }
  function awardMoney(user, amount, chan = undefined) {
    let money = getMoney(user)
    db.setUserOption(user.id, 'balance', parseInt(money) + amount)
    let newBal = getMoney(user)
    if (typeof chan != 'undefined') {
      let embed = new RichEmbed()
      embed.setErisAuthor(user)
      embed.setColor(colorcfg.green)
      embed.setDescription(`You have been awarded **${amount.toString()} ¢**!`)
      embed.addField('New Balance', newBal + ' ¢', true)
      embed.setTimestamp()
      chan.createMessage({ embed })
    }
  }

  function genFlipRound(user, amount, uuid) {
    let randomizer = Date.now() + user.createdAt
    let clientSeed,
      serverSeed
    let clientKey = randomstring.generate({
      length: 16,
      charset: 'hex'
    })
    let serverKey = randomstring.generate({
      length: 24,
      charset: 'hex'
    })
    let _clientSeed = db.getUserOption(user.id, 'nonce')
    let _serverSeed = db.getUserOption(user.id, 'userseed')
    let _clientSeedHasher = crypto.createHmac('sha512', clientKey).update(_clientSeed)
    let _serverSeedHasher = crypto.createHmac('sha512', serverKey).update(_serverSeed)
    clientSeed = _clientSeedHasher.digest('hex')
    serverSeed = _serverSeedHasher.digest('hex')

    let resHasher = crypto.createHmac('sha512', `${clientSeed}|${randomizer}*${amount}`).update(serverSeed)
    let resHash = resHasher.digest('hex')
    let f5 = parseInt(resHash.substring(0, 5), 16)
    if (f5 > 999999) f5 = parseInt(resHash.substring(10, 5), 16)
    let roundRes = (f5 % (10000)) / 100
    console.log(roundRes)
    return {
      randomizer: randomizer,
      clientSeed: clientSeed,
      serverSeed: serverSeed,
      clientKey: clientKey,
      serverKey: serverKey,
      amount: amount,
      roundRes: roundRes
    }
  }

  let moneyCommand = bot.registerCommand('money', (msg, args) => {
    msg.channel.createMessage(`\`cy!money\` is broken. come back later!`)
    //return sr`Invalid usage.
    //\`cy!money [balance|pay|flip|register]\``
  }, {
      aliases: ['m', '$'],
      description: 'Money!',
      fullDescription: 'Do stuff with Cyclone coins (¢)'
    })
  moneyCommand.registerSubcommand('balance', (msg, args) => {
    let bal = getMoney(msg.author)
    if (typeof bal == 'undefined' || bal == 0) {
      return 'You have **0 ¢** :('
    }
    return `You have **${bal.toString()} ¢**`
  }, {
      description: 'Get the balance of your Cyclone account.',
      fullDescription: 'Get the balance of your Cyclone account.',
      aliases: ['bal', '$', '$$', '$$$', 'money', 'account', 'acct'],
      requirements: {
        userIDs: ['116693403147698181']
      },
    })
  moneyCommand.registerSubcommand('register', (msg, args) => {
    let registered = db.getUserOption(msg.author.id, 'registered')
    if (registered) {
      return 'You have already registered for a Cyclone account.'
    }
    let userSeed = randomstring.generate({
      length: 16,
      charset: 'hex'
    })
    db.setUserOption(msg.author.id, 'balance', 0)
    awardMoney(msg.author, 500, msg.channel)
    db.setUserOption(msg.author.id, 'registered', true)
    db.setUserOption(msg.author.id, 'userseed', userSeed)
    return sr`You have opened an account with Cyclone.
    Your user seed to confirm all results is \`${userSeed}\`
    Please keep this seed safe. You can share it with anyone, it holds no value except to confirm results.`
  }, {
    requirements: {
      userIDs: ['116693403147698181']
    },
  })
  moneyCommand.registerSubcommand('newseed', (msg, args) => {
    let userSeed = randomstring.generate({
      length: 16,
      charset: 'hex'
    })
    db.setUserOption(msg.author.id, 'userseed', userSeed)
    return sr`You have regenerated your user seed. Your old seed is no longer valid for any results.
    Your new user seed to confirm all results is \`${userSeed}\`
    Please keep this seed safe. You can share it with anyone, it hold no value except to confirm results.`
  }, {
      description: 'Generate a new user seed for your account',
      fullDescription: 'Generate a new user seed for your account',
      cooldown: 30 * 60 * 1000, // 30 minutes
      requirements: {
        userIDs: ['116693403147698181']
      }
    })

  moneyCommand.registerSubcommand('flip', (msg, args) => {
    let heads
    if (args[0] == 'heads' || args[0] == 'h') heads = true
    if (args[0] == 'tails' || args[0] == 't') heads = false
    let nonce = db.getUserOption(msg.author.id, 'nonce')
    if (typeof nonce == 'undefined' || nonce == '') {
      return sr`Please set your nonce by doing cy!money setnonce 'nonce'
      You do not need to use quotes around your nonce.`
    }
    let userseed = db.getUserOption(msg.author.id, 'userseed')
    if (typeof nonce == 'undefined' || nonce == '') {
      return sr`Please set your userseed by doing cy!money newseed`
    }
    if(isNaN(args[1])) return sr`Please put in a valid amount.`
    if(getMoney(msg.author) < parseInt(args[1])) return sr`You do not have enough money.`
    if (heads == true || heads == false) {
      let amount = parseInt(args[1])
      if (amount < 1) return sr`Please bet more than 1 ¢.`
      takeMoney(msg.author, parseInt(args[1]))
      log.info(`Took ${amount} from ${msg.author.username}#${msg.author.discriminator} (${msg.author.id}) for using cy!flip ${heads ? 'heads' : 'tails'} ${amount.toString()}`)
      let uuid = uuidv4()
      let number = parseInt(crypto.randomBytes(Math.ceil(2)).toString('hex').slice(0, 4), 16)
      let output = []
      let sNumber = number.toString()
      for (var i = 0, len = sNumber.length; i < len; i += 1) output.push(+sNumber.charAt(i));
      for (var i = 0, sum = 0; i < output.length; sum += output[i++]);
      console.log(uuid)
      console.log(sum)
      let hash = genFlipRound(msg.author, amount, uuid)
      require('requestify').post('https://hastebin.com/documents', base64(sr`Randomizer: ${hash.randomizer}
      Client seed: ${hash.clientSeed} (key: ${hash.clientKey})
      User seed (Srv seed): ${hash.serverSeed} (key: ${hash.serverKey})
      Amount: ${hash.amount}
      Result: ${hash.roundRes}`)).then((response) => {
        let end = ``
        let res = true
        if (parseInt(hash.roundRes) > 100) {
          awardMoney(msg.author, amount)
          return `Round was a failure, returned money. over 100`
        }
        if (parseInt(hash.roundRes) > 50) {
          res = true
        } else if (parseInt(hash.roundRes) < 50) {
          res = false
        } else {
          awardMoney(msg.author, amount)
          return `Round was a failure, returned money. else 167`
        }
        if (res == true && heads == true) {
          awardMoney(msg.author, amount * 3)
          let newBal = getMoney(msg.author)
          let embed = new RichEmbed()
          embed.setErisAuthor(msg.author)
          embed.setColor(colorcfg.green)
          embed.setDescription(`You have won the round! Round: https://hastebin.com/raw/${response.getBody().key}`)
          embed.addField(`Won`, (amount * 2).toString() + ' ¢')
          embed.addField('New Balance', newBal + ' ¢', true)
          embed.setTimestamp()
          msg.channel.createMessage({ embed })
          log.info(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id}) won round ${response.getBody().key}, amount ${amount}`)
        } else if (res == false && heads == false) {
          awardMoney(msg.author, amount * 3)
          let newBal = getMoney(msg.author)
          let embed = new RichEmbed()
          embed.setErisAuthor(msg.author)
          embed.setColor(colorcfg.green)
          embed.setDescription(`You have won the round! Round: https://hastebin.com/raw/${response.getBody().key}`)
          embed.addField(`Won`, (amount * 2).toString() + ' ¢')
          embed.addField('New Balance', newBal + ' ¢', true)
          embed.setTimestamp()
          msg.channel.createMessage({ embed })
          log.info(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id}) won round ${response.getBody().key}, amount ${amount}`)
        } else {
          let newBal = getMoney(msg.author)
          let embed = new RichEmbed()
          embed.setErisAuthor(msg.author)
          embed.setColor(colorcfg.red)
          embed.setDescription(`You have lost the round! Round: https://hastebin.com/raw/${response.getBody().key}`)
          embed.addField(`Lost`, (amount).toString() + ' ¢')
          embed.addField('New Balance', newBal + ' ¢', true)
          embed.setTimestamp()
          msg.channel.createMessage({ embed })
          log.info(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id}) lost round ${response.getBody().key}, amount ${amount}`)
        }
      })
    } else {
      return sr`Invalid usage!
      cy!money flip [heads/tails] [amount]`
    }
  }, {
      description: 'Flip',
      requirements: {
        userIDs: ['116693403147698181']
      },
  })
  moneyCommand.registerSubcommand('highlow', (msg, args) => {
    let high
    if (args[0] == 'high' || args[0] == 'h' || args[0] == '>') high = true
    if (args[0] == 'low' || args[0] == 'l' || args[0] == '<') high = false
    if(typeof db.getUserOption(msg.author.id, 'registered') == 'undefined') return sr`Register an account with \`cy!money register\``
    let nonce = db.getUserOption(msg.author.id, 'nonce')
    if (typeof nonce == 'undefined' || nonce == '') {
      return sr`Please set your nonce by doing cy!money setnonce 'nonce'
      You do not need to use quotes around your nonce.`
    }
    if(isNaN(args[2])) return sr`Please put in a valid amount.`
    if(isNaN(args[1])) return sr`Please put in a valid number.`
    let userseed = db.getUserOption(msg.author.id, 'userseed')
    if (typeof nonce == 'undefined' || nonce == '') {
      return sr`Please set your userseed by doing cy!money newseed`
    }
    if(getMoney(msg.author) < parseInt(args[2])) return sr`You do not have enough money.`
    if (high == true || high == false) {
      let amount = parseInt(args[2])
      if (amount < 1) return sr`Please bet more than 1 ¢.`
      if (parseInt(args[1]) > 100) return sr`Please lower your number below 100.` 
      takeMoney(msg.author, parseInt(args[2]))
      log.info(`Took ${amount} from ${msg.author.username}#${msg.author.discriminator} (${msg.author.id}) for using cy!highlow ${high ? 'high' : 'low'} ${amount.toString()}`)
      let uuid = uuidv4()
      let number = parseInt(crypto.randomBytes(Math.ceil(2)).toString('hex').slice(0, 4), 16)
      let output = []
      let sNumber = number.toString()
      for (var i = 0, len = sNumber.length; i < len; i += 1) output.push(+sNumber.charAt(i));
      for (var i = 0, sum = 0; i < output.length; sum += output[i++]);
      console.log(uuid)
      console.log(sum)
      let hash = genFlipRound(msg.author, amount, uuid)
      require('requestify').post('https://hastebin.com/documents', base64(sr`Randomizer: ${hash.randomizer}
      Client seed: ${hash.clientSeed} (key: ${hash.clientKey})
      User seed (Srv seed): ${hash.serverSeed} (key: ${hash.serverKey})
      Amount: ${hash.amount}
      Result: ${hash.roundRes}`)).then((response) => {
        let end = ``
        let res = true
        if (parseInt(hash.roundRes) > 100) {
          awardMoney(msg.author, amount)
          return `Round was a failure, returned money. over 100`
        }
        let num = parseInt(args[1])
        if(high) {
          if(parseInt(hash.roundRes) > num) res = true
          if(parseInt(hash.roundRes) < num) res = false
        } else if(!high) {
          if(parseInt(hash.roundRes) < num) res = false
          if(parseInt(hash.roundRes) > num) res = true
        } else {
          awardMoney(msg.author, amount)
          return `Round was a failure, returned money. else 167`
        }
        let multiplier
        if(!high) {
          if(num > 80) {
            multiplier = (100 - num) * 0.001
          } else {
            multiplier = (100 - num) * 0.001
          }
          
        } else {
          multiplier = num * 0.001
        }
        if (res == true && high == true) {
          awardMoney(msg.author, amount + (amount * multiplier))
          let newBal = getMoney(msg.author)
          let embed = new RichEmbed()
          embed.setErisAuthor(msg.author)
          embed.setColor(colorcfg.green)
          embed.setDescription(`You have won the round! Round: https://hastebin.com/raw/${response.getBody().key}`)
          embed.addField(`Won`, (amount * multiplier).toString() + ' ¢')
          embed.addField('New Balance', newBal + ' ¢', true)
          embed.setTimestamp()
          msg.channel.createMessage({ embed })
          log.info(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id}) won round ${response.getBody().key}, amount ${amount}`)
        } else if (res == false && high == false) {
          awardMoney(msg.author, amount + (amount * multiplier))
          let newBal = getMoney(msg.author)
          let embed = new RichEmbed()
          embed.setErisAuthor(msg.author)
          embed.setColor(colorcfg.green)
          embed.setDescription(`You have won the round! Round: https://hastebin.com/raw/${response.getBody().key}`)
          embed.addField(`Won`, (amount * multiplier).toString() + ' ¢')
          embed.addField('New Balance', newBal + ' ¢', true)
          embed.setTimestamp()
          msg.channel.createMessage({ embed })
          log.info(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id}) won round ${response.getBody().key}, amount ${amount}`)
        } else {
          let newBal = getMoney(msg.author)
          let embed = new RichEmbed()
          embed.setErisAuthor(msg.author)
          embed.setColor(colorcfg.red)
          embed.setDescription(`You have lost the round! Round: https://hastebin.com/raw/${response.getBody().key}`)
          embed.addField(`Lost`, (amount).toString() + ' ¢')
          embed.addField('New Balance', newBal + ' ¢', true)
          embed.setTimestamp()
          msg.channel.createMessage({ embed })
          log.info(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id}) lost round ${response.getBody().key}, amount ${amount}`)
        }
      })
    } else {
      return sr`Invalid usage!
      cy!money highlow [high/low] [number] [amount]`
    }
  }, {
    requirements: {
      userIDs: ['116693403147698181']
    },
  })
  moneyCommand.registerSubcommand('setnonce', (msg, args) => {
    let nonce = args.join(' ')
    db.setUserOption(msg.author.id, 'nonce', nonce)
    return sr`Success!
    Your nonce was set to ${nonce}`
  }, {
      argsRequired: true,
      description: 'Set a nonce to make sure results are provably fair',
      fullDescription: 'Set a nonce to make sure results are provably fair',
      requirements: {
        userIDs: ['116693403147698181']
      },
    })
  moneyCommand.registerSubcommand('award', (msg, args) => {
    let target = msg.mentions[0]
    return awardMoney(target, parseInt(args[1]), msg.channel)
  }, {
    requirements: {
      userIDs: ['116693403147698181']
    },
    description: 'Set a users balance in the database',
    fullDescription: 'Set a users balance in the database'
  })
  moneyCommand.registerSubcommand('transfer', (msg, args) => {
    let target
    if(!msg.mentions) return sr`Please mention a user to pay to.`
    target = msg.mentions[0]
    let amount = args[1]
    if(!amount || !args[1]) return sr`Please put in a correct amount to pay.`
    if(isNaN(amount)) return sr`No cheating!`
    amount = parseInt(amount)
    if(target.id == '327650579671154689') {
      awardMoney(msg.author, -amount)
      awardMoney(target, amount)
      bot.getDMChannel(target.id).then((chan) => {
        chan.createMessage(`pay|${msg.author.id}|${args[1]}`)
      })
      return sr`Sent ${amount} to <@${target.id}>`
    } else {
      awardMoney(msg.author, -amount)
      awardMoney(target, amount)
      bot.getDMChannel(target.id).then((chan) => {
        chan.createMessage(`Hey, you've been sent ${amount} by ${msg.author.username}#${msg.author.discriminator}`)
      })
      return sr`Sent ${amount} to <@${target.id}>`
    }
  }, {
    requirements: {
      userIDs: ['116693403147698181']
    }
  })
  log.info('Money commands registered')
}