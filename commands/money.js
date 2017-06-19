const sr = require('common-tags').stripIndents
const RichEmbed = require('../embed')
const colorcfg = {
  green: '#139A43',
  red: '#DA2C38',
  blue: '#256EFF',
  purple: '#5E239D',
  green2: '#0DAB76'
}

module.exports = function (bot, db, log) {
  function getMoney(user) {
    return db.getUserOption(user.id, 'money.balance')
  }
  function awardMoney(user, amount, chan = undefined) {
    let money = getMoney(user)
    db.setUserOption(user.id, 'money.balance', parseInt(money) + amount)
    let newBal = getMoney(user)
    if(typeof chan != 'undefined') {
      let embed = new RichEmbed()
      embed.setErisAuthor(user)
      embed.setColor(colorcfg.green)
      embed.setDescription(`You have been awarded **${amount.toString()}**!`)
      embed.addField('New Balance', newBal, true)
      embed.setTimestamp()
      chan.createMessage({embed})
    }
  }
  let moneyCommand = bot.registerCommand('money', (msg, args) => {
    return sr`Invalid usage.
    \`cy!money [balance|pay|flip|register]\``
  })
  moneyCommand.registerSubcommand('balance', (msg, args) => {
    let bal = getMoney(msg.author)
    if(typeof bal == 'undefined' || bal == 0) {
      return 'You have **0 ¢** :('
    }
    return `You have **${bal.toString()} ¢**`
  }, {
    description: 'Get the balance of your Cyclone account.',
    fullDescription: 'Get the balance of your Cyclone account.',
    aliases: ['bal', '$', '$$', '$$$', 'money', 'account', 'acct']
  })
  moneyCommand.registerSubcommand('register', (msg, args) => {
    let registered = db.getUserOption(msg.author.id, 'money.registered', false)
    if(registered) {
      return 'You have already registered for a Cyclone account.'
    }
    db.setUserOption(msg.author.id, 'money.balance', 0)
    awardMoney(user, 500, msg.channel)
    db.setUserOption(msg.author.id, 'money.registered', true)
  })
  log.info('Money commands registered')
}