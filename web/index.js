module.exports = (bot, db, log) => {
  const express = require('express')
  const app = express()
  const path = require('path')

  app.set('view engine', 'ejs')
  app.set('views', path.join(__dirname, 'views'))
  app.disable('x-powered-by')
  app.use(express.static(path.join(__dirname, 'public')))
  app.use((req, res, next) => {
    res.setHeader('x-hacker', 'join the server please https://discord.gg/BDgGx5N')
    return next()
  })
  app.get('/', async (req, res) => {
    let stats = await db.r.table('stats').get('message').run()
    let msg = stats.count
    res.render('index', {
      bot: bot,
      msgCount: msg
    })
  })
  app.listen(7233, () => {
    log.info('Webserver listening on port 7233')
  })
}