function setEnv(env){
  process.env.NODE_ENV = env
}
let args = process.argv.slice(2)
if((process.env.NODE_ENV && process.env.NODE_ENV.startsWith('dev')) || args[0] === 'dev' || args[0] === 'development') {
  setEnv('dev')
} else {
  setEnv('prod')
}


require('./bot')