/**
 * Project............: Cyclone
 * File...............: admin.js
 * Author.............: Relative
 * Created on.........: 11/26/2016
 */
const express = require('express')
const requestify = require('requestify')
const config = require('../config.json')
const api = require('../adminApi')
const jwt = require('jsonwebtoken')
const router = express.Router()

router.route('/')
  .get((req,res,next) => {
    api.init(req.app.get('bot'))
    if(!req.query || !req.query.session){
      let error = new Error('Unauthorized - token invalid')
      error.status = 401
      return next(error)
    }
    let body = {
      user: {},
      guilds: [],
      originalGuilds: [],
      guildCount: 0,
      query: `?session=${req.query.session}`,
      bot: req.app.get('bot')
    }
    let bot = req.app.get('bot')
    try{
      let decoded = jwt.verify(req.query.session, config.jwt_key)
      requestify.get('https://discordapp.com/api/users/@me', {
        headers: {
          Authorization: decoded.combined_token
        }
      }).then((response) => {
        body.user = response.getBody()
        api.getGuildsUserAdmins(body.user.id, (err, admins) => {
          for (let __guild in admins) {
            if (!admins.hasOwnProperty(__guild)) continue
            let _guild = admins[__guild]
            let guild = bot.guilds.find('id', _guild)
            let gRe = {
              id: _guild,
              name: guild.name,
              icon: guild.icon
            }
            body.guilds.push(gRe)
          }
          body.guildCount = body.guilds.length
          res.render('admin', body)
        })
      })
    }catch(ex){
      let error = new Error('Unauthorized - token invalid')
      error.status = 401
      console.log(ex)
      return next(error)
    }
  })

router.route('/server/:id')
  .get((req,res,next) => {
    api.init(req.app.get('bot'))
    if(!req.query || !req.query.session){
      let error = new Error('Unauthorized - token invalid')
      error.status = 401
      return next(error)
    }
    if(!req.params || !req.params.id){
      let error = new Error('Missing Guild ID')
      error.status = 400
      return next(error)
    }
    let body = {
      guildId: req.params.id,
      guild: {},
      guilds: [],
      originalGuilds: [],
      guildCount: 0,
      user: {},
      botGuild: null,
      query: `?session=${req.query.session}`,
      bot: req.app.get('bot'),
      api: api
    }
    let bot = req.app.get('bot')
    try{
      let decoded = jwt.verify(req.query.session, config.jwt_key)
      requestify.get('https://discordapp.com/api/users/@me', {
        headers: {
          Authorization: decoded.combined_token
        }
      }).then((response) => {
        body.user = response.getBody()
        if(!bot.guilds.exists('id', req.params.id)){
          let error = new Error('That server is not occupied by Cyclone!')
          error.status = 400
          return next(error)
        }
        api.getGuildsUserAdmins(body.user.id, (err, admins) => {
          for(let __guild in admins){
            if(!admins.hasOwnProperty(__guild)) continue
            let _guild = admins[__guild]
            let guild = bot.guilds.find('id', _guild)
            let gRe = {
              id: _guild,
              name: guild.name,
              icon: guild.icon
            }
            body.guilds.push(gRe)
          }
          body.guildCount = body.guilds.length
          for(let __guild in admins){
            if(!admins.hasOwnProperty(__guild)) continue
            let _guild = admins[__guild]
            let guild = bot.guilds.find('id', _guild)
            if(_guild == req.params.id){
              let gRe = {
                id: _guild,
                name: guild.name,
                icon: guild.icon
              }
              body.guild = gRe
              body.botGuild = guild.members.array()
              return res.render('admin-server', body)
            }
          }
          let error = new Error('Unauthorized - You are not the owner of that guild!')
          error.status = 401
          return next(error)
        })

      })
    }catch(ex){
      let error = new Error('Unauthorized - token invalid')
      error.status = 401
      return next(error)
    }
  })

router.route('/server/:id/api/get/:cfg')
  .get((req,res,next) => {
    if(!req.query || !req.query.session){
      let error = new Error('Unauthorized - token invalid')
      error.status = 401
      return next(error)
    }
    if(!req.params || !req.params.id || !req.params.cfg){
      let error = new Error('Missing params in request')
      error.status = 400
      return next(error)
    }
    try{
      let decoded = jwt.verify(req.query.session, config.jwt_key)
      requestify.get('https://discordapp.com/api/users/@me', {
        headers: {
          Authorization: decoded.combined_token
        }
      }).then((response) => {
        let body = response.getBody()
        api.isUserAdmin(req.params.id, body.id, (err, admin) => {
          if(!admin){
            let error = new Error('Unauthorized - You are not an admin of that guild!')
            error.status = 401
            return next(error)
          }
          api.findGuildById(req.params.id, (err, guild) => {
            if(err){
              err.status = 500
              return next(err)
            }
            return res.send(guild.config[req.params.cfg])
          })
        })
      })
    }catch(ex){
      let error = new Error('Unauthorized - token invalid')
      error.status = 401
      return next(error)
    }
  })

router.route('/server/:id/api/set/:cfg/:val')
  .get((req,res,next) => {
    if(!req.query || !req.query.session){
      let error = new Error('Unauthorized - token invalid')
      error.status = 401
      return next(error)
    }
    if(!req.params || !req.params.id || !req.params.cfg || !req.params.val){
      let error = new Error('Missing params in request')
      error.status = 400
      return next(error)
    }
    try{
      let decoded = jwt.verify(req.query.session, config.jwt_key)
      requestify.get('https://discordapp.com/api/users/@me', {
        headers: {
          Authorization: decoded.combined_token
        }
      }).then((response) => {
        let body = response.getBody()
        api.isUserAdmin(req.params.id, body.id, (err, admin) => {
          if(!admin){
            let error = new Error('Unauthorized - You are not an admin of that guild!')
            error.status = 401
            return next(error)
          }
          api.setGuildCfg(req.params.id, req.params.cfg, req.params.val)
          return res.send('success')
        })
      })
    }catch(ex){
      let error = new Error('Unauthorized - token invalid')
      error.status = 401
      return next(error)
    }
  })

router.route('/server/:id/api/isadmin/:userId')
  .get((req,res,next) => {
    if(!req.query || !req.query.session){
      let error = new Error('Unauthorized - token invalid')
      error.status = 401
      return next(error)
    }
    if(!req.params || !req.params.id || !req.params.userId){
      let error = new Error('Missing params in request')
      error.status = 400
      return next(error)
    }
    try{
      let decoded = jwt.verify(req.query.session, config.jwt_key)
      api.isUserAdmin(req.params.id, req.params.userId, (err, admin) => {
        res.send(admin.toString())
      })
    }catch(ex){
      let error = new Error('Unauthorized - token invalid')
      error.status = 401
      return next(error)
    }
  })
router.route('/server/:id/api/setadmin/:userId/:admin')
  .get((req,res,next) => {
    if(!req.query || !req.query.session){
      let error = new Error('Unauthorized - token invalid')
      error.status = 401
      return next(error)
    }
    if(!req.params || !req.params.id || !req.params.userId || !req.params.admin){
      let error = new Error('Missing params in request')
      error.status = 400
      return next(error)
    }
    try{
      let decoded = jwt.verify(req.query.session, config.jwt_key)
      requestify.get('https://discordapp.com/api/users/@me', {
        headers: {
          Authorization: decoded.combined_token
        }
      }).then((response) => {
        let body = response.getBody()
        api.isUserAdmin(req.params.id, body.id, (err, admin) => {
          if(!admin){
            let error = new Error('Unauthorized - You are not admin of that guild!')
            error.status = 401
            return next(error)
          }
          api.setUserAdmin(req.params.id, req.params.userId, req.params.admin)
          return res.send('success')
        })
      })
    }catch(ex){
      let error = new Error('Unauthorized - token invalid')
      error.status = 401
      return next(error)
    }
  })


module.exports = router