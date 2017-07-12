module.exports = {
  apps: [{
    name: 'Cyclone',
    script: 'index.js',
    env_production : {
      NODE_ENV: 'production'
    },
    env_development: {
      NODE_ENV: 'dev'
    }
  }],
  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy: {
    production: {
      user: 'cyclone',
      host: '69.195.152.138',
      ref: 'origin/master',
      repo: 'git@github.com:FNCxPro/cyclone.git',
      path: '~/cyclone',
      'post-deploy': 'chmod +x ~/cyclone/current/deploy/prod.sh && ./deploy/prod.sh'
    },
    development: {
      user: 'cyclone',
      host: '192.168.7.5',
      ref: 'origin/master',
      repo: 'git@github.com:FNCxPro/cyclone.git',
      path: '/home/cyclone/dev',
      'post-deploy': 'chmod +x ~/cyclone/current/deploy/prod.sh && ./deploy/prod.sh',
      env: {
        NODE_ENV: 'dev'
      }
    }
  }
};
