process.env.NODE_ENV = 'prod'
let args = process.argv.slice(2)
if (args[0] === 'dev' || args[0] === 'development') {
  process.env.NODE_ENV = 'dev'
}


require('./bot')