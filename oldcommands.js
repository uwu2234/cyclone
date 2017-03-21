function createCommands(){
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