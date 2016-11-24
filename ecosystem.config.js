module.exports = {
  apps : [{
      name      : "Cyclone",
      script    : "index.js",
      env: {
        COMMON_VARIABLE: "true"
      },
      env_production : {
        NODE_ENV: "production"
      }
    }
  ],
  deploy : {
    production : {
      key  : "C:/Users/Seth/.ssh/id_rsa",
      user : "node",
      host : "192.168.7.248",
      ref  : "origin/master",
      repo : "git@github.com:FNCxPro/cyclone.git",
      path : "/home/node/cyclone/",
      ssh_options: "StrictHostKeyChecking=no",
      "post-deploy" : "npm install && pm2 startOrRestart ecosystem.config.js --env production"
    }
  }
}
