module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
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
      path : '/home/cyclone/prod',
      'post-deploy' : 'chmod +x deploy/prod.sh && ./deploy/prod.sh'
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
