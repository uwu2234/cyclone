/**
 * Project............: Cyclone
 * File...............: server.js
 * Author.............: Relative
 * Created on.........: 11/25/2016
 */

const express = require('express')
const requestify = require('requestify')
const logger = require('./log')
const config = require('./config.json')

const app = express()
app.disable('x-powered-by')


app.get('/auth', (req,res,next) => {
  if(!req.query || !req.query.code){
    return res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${config.client_id}&scope=identify%20email%20guilds&response_type=code&redirect_uri=http://cyclonebot.com/auth`)
  }
  let toSend = {}
  requestify.request('https://discordapp.com/api/oauth2/token', {
    method: 'POST',
    params: {
      client_id: config.client_id,
      client_secret: config.client_secret,
      grant_type: 'authorization_code',
      scope: 'identify email guilds',
      code: req.query.code,
      redirect_uri: 'http://cyclonebot.com/auth'
    }
  }).then((response) => {
    let body = response.getBody()
    requestify.get('https://discordapp.com/api/users/@me', {
      headers: {
        'Authorization': `Bearer ${body.access_token}`
      }
    }).then((response) => {
      let _body = response.getBody()
      res.json(_body)
    })
  })
})


app.listen(config.server_port, () => {
  logger.log(`Webserver listening on port ${config.server_port}`)
})

module.exports = app