const Command = require('../cmdModule/commands').Command
const _api = require('../api')

class BetCommand extends Command {
  constructor() {
    super({
      name: 'bet',
      help: 'Bet your money and probably lose'
    })
  }

  async run(message, args, api) {
    if(!args[1]){
      return api.error(`Usage: ${api.handler.prefix}bet <money>`)
    }
    let toGamble = parseInt(args[1])
    if(0 > toGamble){
      return api.error(`${toGamble} is less than 0. Aborting bet.`)
    }
    _api.getBalance(message.author.id, (err, bal) => {
      if(err){
        return api.error('Error getting your balance. Nothing has been transacted from your account.')
      }
      let curBal = bal
      if(toGamble > curBal){
        return api.error('You do not have enough money to bet on that. Nothing has been transacted from your account.')
      }
      _api.subtractBalance(message.author.id, toGamble, (err) => {
        if(err){
          return api.error('Error subtracting gamble from your balance. Nothing has been transacted from your account.')
        }
        let rdm = Math.floor(Math.random()*(100)+1)
        let moneyToGive = 0
        if(rdm <= 1){
          moneyToGive = toGamble*10
          _api.addBalance(message.author.id, moneyToGive, (err) => {
            if(err){
              return api.error(`Error giving you your money. Please show @Relative#2600 this message with the amount: ${toGamble} ${moneyToGive}`)
            }
            message.channel.sendMessage(`:white_check_mark: :moneybag: You have won **$${moneyToGive}**! Your lucky number is ${rdm}. Check your balance with ${api.handler.prefix}balance`)
          })
        }else if(rdm <= 42){
          message.channel.sendMessage(`:x: :bomb: You have lost **$${toGamble}**! Your unlucky number is ${rdm}. Check your balance with ${api.handler.prefix}balance`)
        }else if(rdm <= 52){
          moneyToGive = toGamble*2
          _api.addBalance(message.author.id, moneyToGive, (err) => {
            if(err){
              return api.error(`Error giving you your money. Please show @Relative#2600 this message with the amount: ${toGamble} ${moneyToGive}`)
            }
            message.channel.sendMessage(`:white_check_mark: :moneybag: You have won **$${moneyToGive}**! Your lucky number is ${rdm}. Check your balance with ${api.handler.prefix}balance`)
          })
        }else if(rdm <= 76){
          message.channel.sendMessage(`:x: :bomb: You have lost **$${toGamble}**! Your unlucky number is ${rdm}. Check your balance with ${api.handler.prefix}balance`)
        }else if(rdm == 77){
          moneyToGive = toGamble*12
          _api.addBalance(message.author.id, moneyToGive, (err) => {
            if(err){
              return api.error(`Error giving you your money. Please show @Relative#2600 this message with the amount: ${toGamble} ${moneyToGive}`)
            }
            message.channel.sendMessage(`:white_check_mark: :money_mouth: You have won **$${moneyToGive}**!!! Your lucky number is ${rdm}. Check your balance with ${api.handler.prefix}balance`)
          })
        }else if(rdm <= 86) {
          moneyToGive = toGamble * 3
          _api.addBalance(message.author.id, moneyToGive, (err) => {
            if (err) {
              return api.error(`Error giving you your money. Please show @Relative#2600 this message with the amount: ${toGamble} ${moneyToGive}`)
            }
            message.channel.sendMessage(`:white_check_mark: :moneybag: You have won **$${moneyToGive}**! Your lucky number is ${rdm}. Check your balance with ${api.handler.prefix}balance`)
          })
        }else if(rdm <= 99){
          message.channel.sendMessage(`:x: :bomb: You have lost **$${toGamble}**! Your unlucky number is ${rdm}. Check your balance with ${api.handler.prefix}balance`)
        }else if(rdm == 100){
          moneyToGive = toGamble * 6
          _api.addBalance(message.author.id, moneyToGive, (err) => {
            if (err) {
              return api.error(`Error giving you your money. Please show @Relative#2600 this message with the amount: ${toGamble} ${moneyToGive}`)
            }
            message.channel.sendMessage(`:white_check_mark: :moneybag: You have won **$${moneyToGive}**! Your lucky number is ${rdm}. Check your balance with ${api.handler.prefix}balance`)
          })
        }else{
          moneyToGive = toGamble * 5000
          _api.addBalance(message.author.id, moneyToGive, (err) => {
            if (err) {
              return api.error(`Error giving you your money. (ha x5000 lost!!!11!1) Please show @Relative#2600 this message with the amount: ${toGamble} ${moneyToGive}`)
            }
            message.channel.sendMessage(`:white_check_mark: :moneybag: You have won **$${moneyToGive}**! (x500). Your **EXTREMELY LUCKY** number is ${rdm}. You have won against all odds due to a programming flaw. Please enjoy the free money. Check your balance with ${api.handler.prefix}balance`)
          })
        }
      })
    })
  }
}

module.exports = BetCommand