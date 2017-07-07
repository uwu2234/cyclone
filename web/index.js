module.exports = (bot, db, log) => {
  const express = require('express')
  const app = express()
  const path = require('path')

  app.set('view engine', 'ejs')
  app.set('views', path.join(__dirname, 'views'))
  app.disable('x-powered-by')
  app.use(express.static(path.join(__dirname, 'public')))
  app.get('/', (req, res) => {
    res.render('index')
  })
  app.listen(7233, console.log('Listening on port 7233'))
}