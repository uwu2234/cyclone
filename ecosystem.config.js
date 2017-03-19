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
    dev : {
      key  : "C:/Users/relat/.ssh/id_rsa",
      user : "node",
      host : "192.168.7.248",
      ref  : "origin/master",
      repo : "git@github.com:FNCxPro/cyclone.git",
      path : "~/cyclone",
      //"pre-deploy-local": "PATH=%PATH%;C:/Program Files/Git/usr/bin",
      "post-deploy" : "chmod +x postDeploy.sh && ./postDeploy.sh"
    },
    production : {
      key  : "/mnt/c/Users/relat/.ssh/id_rsa",
      user : "ubuntu",
      host : "69.195.152.138",
      ref  : "origin/master",
      repo : "git@github.com:FNCxPro/cyclone.git",
      path : "~/cyclone",
      //"pre-deploy-local": "PATH=%PATH%;C:/Program Files/Git/usr/bin",
      "post-deploy" : "chmod +x postDeployProd.sh && ./postDeployProd.sh"
    }
  }
}
