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
          for (let _guild in admins) {
            if (!admins.hasOwnProperty(_guild)) continue
            console.log(_guild)
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
        if(!bot.guilds.exists('id', req.params.id)){
          let error = new Error('That server is not occupied by Cyclone!')
          error.status = 400
          return next(error)
        }
        api.getGuildsUserAdmins(body.user.id, (err, admins) => {
          for(let _guild in admins){
            if(!admins.hasOwnProperty(_guild)) continue
            let guild = bot.guilds.find('id', _guild)
            let gRe = {
              id: _guild,
              name: guild.name,
              icon: guild.icon
            }
            body.guilds.push(gRe)
          }
          body.guildCount = body.guilds.length
          for(let _guild in admins){
            if(!admins.hasOwnProperty(_guild)) continue
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
        })
        let error = new Error('Unauthorized - You are not the owner of that guild!')
        error.status = 401
        return next(error)
      })
    }catch(ex){
      let error = new Error('Unauthorized - token invalid')
      error.status = 401
      return next(error)
    }
  })



module.exports = router