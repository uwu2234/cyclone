/**
 * Project............: Cyclone
 * File...............: server.js
 * Author.............: Relative
 * Created on.........: 11/25/2016
 */

const express = require('express')
const requestify = require('requestify')
const jwt = require('jsonwebtoken')
const path = require('path')
const logger = require('./log')
const config = require('./config.json')

const app = express()
const authArray = []

app.disable('x-powered-by')
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))

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
    let payloadRaw = {
      token: body.access_token,
      combined_token: 'Bearer '+body.access_token
    }
    let payload = jwt.sign(payloadRaw, config.jwt_key, { expiresIn: '15m' })
    res.redirect(`/admin?session=${payload}`)
  })
})

app.get('/admin', (req,res,next) => {
  if(!req.query || !req.query.session){
    let error = new Error('Unauthorized - token invalid')
    error.status = 401
    return next(error)
  }
  let body = {
    user: {},
    guilds: {}
  }
  try{
    let decoded = jwt.verify(req.query.session, config.jwt_key)
    requestify.get('https://discordapp.com/api/users/@me', {
      headers: {
        Authorization: decoded.combined_token
      }
    }).then((response) => {
      body.user = response.getBody()
      requestify.get('https://discordapp.com/api/users/@me/guilds', {
        headers: {
          Authorization: decoded.combined_token
        }
      }).then((response) => {
        body.guilds = response.getBody()
        res.render('admin', body)
      })
    })
  }catch(ex){
    let error = new Error('Unauthorized - token invalid')
    error.status = 401
    return next(error)
  }
})

app.get('/discord', (req,res,next) => {
  res.redirect('https://discord.gg/yy83Dz4')
})

app.get('/joinserver', (req,res,next) => {
  res.redirect('https://discordapp.com/oauth2/authorize?client_id=194960506308526080&scope=bot&permissions=0')
})

app.get('/', (req,res,next) => {
  let bot = app.get('bot')

  res.render('index', {
    servers: bot.guilds.array().length,
    channels: bot.channels.array().length,
    users: bot.users.array().length
  })
})

app.use((req,res,next) => {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use((err,req,res,next) => {
  res.locals.message = err.message
  res.locals.status = err.status || 500
  res.locals.error = config.production ? {} : err
  res.status(err.status || 500)
  res.render('error')
})

app.listen(config.server_port, () => {
  logger.log(`Webserver listening on port ${config.server_port}`)
})

module.exports = app