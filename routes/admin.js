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
      query: `?session=${req.query.session}`
    }
    console.log('before try')
    try{
      console.log('in try')
      let decoded = jwt.verify(req.query.session, config.jwt_key)
      console.log(decoded)
      requestify.get(`https://discordapp.com/api/users/@me/guilds`, {
        headers: {
          Authorization: decoded.combined_token
        }
      }).then((response) => {
        console.log('users/@me/guilds response ')
        let guilds = response.getBody()
        body.originalGuilds = response.getBody()
        for(let guild in guilds){
          if(!guilds.hasOwnProperty(guild)) continue
          console.log('inside 1st guild loop')
          let g = guilds[guild]
          if(g.owner){
            body.guilds.push(g)
          }
        }
        console.log('out of 1st guild loop')
        body.guildCount = body.guilds.length
        for(let guild in guilds){
          if(!guilds.hasOwnProperty(guild)) continue
          console.log('inside 2nd guild loop')
          let g = guilds[guild]
          if(g.id == req.params.id){
            console.log('guild id == request id')
            if(g.owner){
              console.log('user is owner of guild')
              body.guild = g
              requestify.get('https://discordapp.com/api/users/@me', {
                headers: {
                  Authorization: decoded.combined_token
                }
              }).then((response) => {
                console.log('users/@me response')
                body.user = response.getBody()
                return res.render('admin-server', body)
              })
            }else{
              console.log('not owner of guild rip')
              let error = new Error('Unauthorized - You are not the owner of that guild!')
              error.status = 401
              return next(error)
            }
          }
        }
        console.log('outside 2nd guild loop')
        let error = new Error('Unauthorized - You are not the owner of that guild!')
        error.status = 400
        return next(error)
      })
    }catch(ex){
      console.log('catch')
      let error = new Error('Unauthorized - token invalid')
      error.status = 401
      return next(error)
    }
  })

module.exports = router