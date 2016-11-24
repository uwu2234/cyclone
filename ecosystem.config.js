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
      user : "node",
      host : "chicago.atlanta.local",
      ref  : "origin/master",
      repo : "git@github.com:FNCxPro/cyclone.git",
      path : "/home/node/cyclone/",
      ssh_options: ["StrictHostKeyChecking=no", "PasswordAuthentication=no","IdentityFile=C:\\Users\\Seth\\.ssh\\id_rsa"],
      "pre-deploy-local": "PATH = %PATH%;C:\\yes\\",
      "post-deploy" : "npm install && pm2 startOrRestart ecosystem.config.js --env production"
    }
  }
}
