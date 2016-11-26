/**
 * Project............: Cyclone
 * File...............: admin.js
 * Author.............: Relative
 * Created on.........: 11/26/2016
 */
const express = require('express')
const requestify = require('requestify')
const config = require('../config.json')
const jwt = require('jsonwebtoken')
const router = express.Router()

router.route('/')
  .get((req,res,next) => {
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
      query: `?session=${req.query.session}`
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
          body.originalGuilds = response.getBody()
          let g = response.getBody()
          for(let guild in g){
            if(g[guild].owner){
              body.guilds.push(g[guild])
            }
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
      query: `?session=${req.query.session}`
    }
    try{
      let decoded = jwt.verify(req.query.session, config.jwt_key)
      requestify.get('https://discordapp.com/api/users/@me', {
        headers: {
          Authorization: decoded.combined_token
        }
      }).then((response) => {
        body.user = response.getBody()
      })
      requestify.get(`https://discordapp.com/api/users/@me/guilds`, {
        headers: {
          Authorization: decoded.combined_token
        }
      }).then((response) => {
        let guilds = response.getBody()
        body.originalGuilds = guilds
        for(let guild in guilds){
          if(!guilds.hasOwnProperty(guild)) continue
          let g = guilds[guild]
          if(g.owner){
            body.guilds.push(g)
          }
        }
        body.guildCount = body.guilds.length
        for(let _guild in guilds){
          if(!guilds.hasOwnProperty(_guild)) continue
          let guild = guilds[_guild]
          if(guild.id == req.params.id){
            if(guild.owner == true){
              body.guild = guild
              return res.render('admin-server', body)
            }else{
              let error = new Error('Unauthorized - You are not the owner of that guild!')
              error.status = 401
              return next(error)
            }
          }
        }
        let error = new Error('Unauthorized - You are not the owner of that guild!')
        error.status = 400
        return next(error)
      })
    }catch(ex){
      let error = new Error('Unauthorized - token invalid')
      error.status = 401
      return next(error)
    }
  })

module.exports = router