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
    return sr`Invalid usage.
    \`cy!money [balance|pay|flip|register]\``
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
      aliases: ['bal', '$', '$$', '$$$', 'money', 'account', 'acct']
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
      cooldown: 30 * 60 * 1000 // 30 minutes
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
      description: 'Flip'
    })
  moneyCommand.registerSubcommand('setnonce', (msg, args) => {
    let nonce = args.join(' ')
    db.setUserOption(msg.author.id, 'nonce', nonce)
    return sr`Success!
    Your nonce was set to ${nonce}`
  }, {
      argsRequired: true,
      description: 'Set a nonce to make sure results are provably fair',
      fullDescription: 'Set a nonce to make sure results are provably fair'
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

  log.info('Money commands registered')
}