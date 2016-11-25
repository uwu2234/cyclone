/**
 * Project............: Cyclone
 * File...............: server.js
 * Author.............: Relative
 * Created on.........: 11/25/2016
 */

const express = require('express')
const logger = require('./log')
const config = require('./config.json')

const app = express()



app.get('/auth_begin', (req,res,next) => {
  res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${config.client_id}&scope=identify%20email%20guilds&redirect_uri=http://cyclonebot.com/auth&response_type=code`)
})
app.get('/auth', (req,res,next) => {
  console.log(req)
  res.send('received')
})


app.listen(config.server_port, () => {
  logger.log(`Webserver listening on port ${config.server_port}`)
})