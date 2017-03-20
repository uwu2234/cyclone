function createCommands(){
  commands.registerCommand('bet', 'Bet your balance and probably lose', (msg,args,apx) => {
    if(!args[1]){
      return apx.error(`Usage: ${apx.getPrefix()}bet <money>`)
    }
    let toGamble = parseInt(args[1])
    if(0 > toGamble){
      return apx.error(`${toGamble} is less than 0. Aborting bet.`)
    }
    api.getBalance(msg.author.id, (err, bal) => {
      if(err){
        return apx.error('Error getting your balance. Nothing has been transacted from your account.')
      }
      let curBal = bal
      if(toGamble > curBal){
        return apx.error('You do not have enough money to bet on that. Nothing has been transacted from your account.')
      }
      api.subtractBalance(msg.author.id, toGamble, (err) => {
        if(err){
          return apx.error('Error subtracting gamble from your balance. Nothing has been transacted from your account.')
        }
        let rdm = Math.floor(Math.random()*(100)+1)
        let moneyToGive = 0
        if(rdm <= 1){
          moneyToGive = toGamble*10
          api.addBalance(msg.author.id, moneyToGive, (err) => {
            if(err){
              return apx.error(`Error giving you your money. Please show @Relative#1027 this message with the amount: ${toGamble} ${moneyToGive}`)
            }
            msg.channel.sendMessage(`:white_check_mark: :moneybag: You have won **$${moneyToGive}**! Your lucky number is ${rdm}. Check your balance with ${apx.getPrefix()}balance`)
          })
        }else if(rdm <= 42){
          msg.channel.sendMessage(`:x: :bomb: You have lost **$${toGamble}**! Your unlucky number is ${rdm}. Check your balance with ${apx.getPrefix()}balance`)
        }else if(rdm <= 52){
          moneyToGive = toGamble*2
          api.addBalance(msg.author.id, moneyToGive, (err) => {
            if(err){
              return apx.error(`Error giving you your money. Please show @Relative#1027 this message with the amount: ${toGamble} ${moneyToGive}`)
            }
            msg.channel.sendMessage(`:white_check_mark: :moneybag: You have won **$${moneyToGive}**! Your lucky number is ${rdm}. Check your balance with ${apx.getPrefix()}balance`)
          })
        }else if(rdm <= 76){
          msg.channel.sendMessage(`:x: :bomb: You have lost **$${toGamble}**! Your unlucky number is ${rdm}. Check your balance with ${apx.getPrefix()}balance`)
        }else if(rdm == 77){
          moneyToGive = toGamble*12
          api.addBalance(msg.author.id, moneyToGive, (err) => {
            if(err){
              return apx.error(`Error giving you your money. Please show @Relative#1027 this message with the amount: ${toGamble} ${moneyToGive}`)
            }
            msg.channel.sendMessage(`:white_check_mark: :money_mouth: You have won **$${moneyToGive}**!!! Your lucky number is ${rdm}. Check your balance with ${apx.getPrefix()}balance`)
          })
        }else if(rdm <= 86) {
          moneyToGive = toGamble * 3
          api.addBalance(msg.author.id, moneyToGive, (err) => {
            if (err) {
              return apx.error(`Error giving you your money. Please show @Relative#1027 this message with the amount: ${toGamble} ${moneyToGive}`)
            }
            msg.channel.sendMessage(`:white_check_mark: :moneybag: You have won **$${moneyToGive}**! Your lucky number is ${rdm}. Check your balance with ${apx.getPrefix()}balance`)
          })
        }else if(rdm <= 99){
          msg.channel.sendMessage(`:x: :bomb: You have lost **$${toGamble}**! Your unlucky number is ${rdm}. Check your balance with ${apx.getPrefix()}balance`)
        }else if(rdm == 100){
          moneyToGive = toGamble * 6
          api.addBalance(msg.author.id, moneyToGive, (err) => {
            if (err) {
              return apx.error(`Error giving you your money. Please show @Relative#1027 this message with the amount: ${toGamble} ${moneyToGive}`)
            }
            msg.channel.sendMessage(`:white_check_mark: :moneybag: You have won **$${moneyToGive}**! Your lucky number is ${rdm}. Check your balance with ${apx.getPrefix()}balance`)
          })
        }else{
          moneyToGive = toGamble * 500
          api.addBalance(msg.author.id, moneyToGive, (err) => {
            if (err) {
              return apx.error(`Error giving you your money. (ha x500 lost!!!11!1) Please show @Relative#1027 this message with the amount: ${toGamble} ${moneyToGive}`)
            }
            msg.channel.sendMessage(`:white_check_mark: :moneybag: You have won **$${moneyToGive}**! (x500). Your **EXTREMELY LUCKY** number is ${rdm}. You have won against all odds due to a programming flaw. Please enjoy the free money. Check your balance with ${apx.getPrefix()}balance`)
          })
        }
      })
    })
  })
  commands.registerCommand('warnings', 'Shows warnings for user', (msg,args,apx) => {
    let target = args[1].replace('<@', '').replace('>', '')
    api.getWarnings(target, (err, warnings) => {
      if(typeof warnings[1] == 'undefined'){
        return apx.success('Target has no warnings on record!')
      }
      let warns = `**Warning record for ${bot.users.get(target).username}**\n`
      let idx = 1
      warnings.forEach((warning) => {
        if(typeof warning === 'undefined' || !warning) return
        warns += api.digitsToEmoji(idx.toString()) + `${warning.reason} *by <@${warning.warner}>*\n`
        idx++
      })
      msg.channel.sendMessage(warns)
    })
  }, 'MANAGE_MESSAGES', '238424240032972801')
  commands.registerCommand('warn', 'Warns user for reason.', (msg,args,apx) => {
    let target = args[1].replace('<@', '').replace('>', '')
    api.addWarning(target, msg.author.id, args[2], (err) => {
      if(err){
        return apx.error('That command failed to execute. Please try again later!')
      }
      return apx.success('User has been warned successfully!')
    })
  }, 'MANAGE_MESSAGES', '238424240032972801')
  commands.registerCommand('clearwarnings', 'Removes all warnings from user', (msg,args,apx) => {
    let target = args[1].replace('<@', '').replace('>', '')
    api.clearWarnings(msg.author.id, (err) => {
      if(err){
        return apx.error('That command failed to execute. Please try again later!')
      }
      return apx.success('User has been cleared of warnings successfully!')
    })
  }, 'MANAGE_MESSAGES', '238424240032972801')

  commands.registerCommand('weather', '**US ONLY** Gives you the weather for your ZIP Code', (msg, args, apx) => {
    if(!args[1]){
      return apx.error(`Usage: ${apx.getPrefix()}weather <zipcode>`)
    }
    let zip = parseInt(args[1])
    if(zip.length > 5){
      return apx.error(`${zip} is not a valid US ZIP Code.`)
    }
    requestify.get(`http://wxdata.weather.com/wxdata/mobile/mobagg/${zip}:4:US.js?key=97ce49e2-cf1b-11e0-94e9-001d092f59fc`).then((res) => {
      let body = res.getBody()
      if(!body || !body[0]){
        return apx.error(`${zip} is not a valid US ZIP Code.`)
      }
      body = body[0]
      let response = `**${body.Location.city}, ${body.Location.state}**'s weather\n`
      let iconName = getIconName(body.HiradObservation.wxIcon)
      response += `${iconEmojiMap[iconName]} **${body.HiradObservation.text}**\n`
      response += `:thermometer: ${body.HiradObservation.temp.toString()}\n`
      response += ` **Feels Like** ${body.HiradObservation.feelsLike.toString()}\n`
      response += `Winds ${body.HiradObservation.wDirText} at ${body.HiradObservation.wSpeed.toString()} mph`
      msg.channel.sendMessage(response)
    })
  })
}