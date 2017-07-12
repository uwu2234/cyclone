module.exports = {

  apps : [
    {
      name: 'Cyclone',
      script: 'index.js',
      env: {
        COMMON_VARIABLE: 'true'
      },
      env_production : {
        NODE_ENV: 'production'
      }
    }
  ],
  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user : 'cyclone',
      host : '69.195.152.138',
      ref  : 'origin/master',
      repo : 'git@github.com:FNCxPro/cyclone.git',
      path : '~/cyclone',
      'post-deploy' : 'chmod +x ~/cyclone/deploy/prod.sh && ./deploy/prod.sh'
    },
    dev: {
      user : 'cyclone',
      host : '192.168.7.5',
      ref  : 'origin/master',
      repo : 'git@github.com:FNCxPro/cyclone.git',
      path : '/home/cyclone/dev',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env dev',
      env  : {
        NODE_ENV: 'dev'
      }
    }
  }
};
