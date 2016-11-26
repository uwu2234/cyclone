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
    let body = {
      guildId: req.params.id,
      guild: {},
      query: `?session=${req.query.session}`
    }
    try{
      let decoded = jwt.verify(req.query.session, config.jwt_key)
      requestify.get(`https://discordapp.com/api/guilds/${req.params.id}`, {
        headers: {
          Authorization: decoded.combined_token
        }
      }).then((response) => {
        let b = response.getBody()
        body.guild = b
        res.json(body)
        //res.render('admin-server', body)
      })
    }catch(ex){
      let error = new Error('Unauthorized - token invalid')
      error.status = 401
      return next(error)
    }
  })

module.exports = router