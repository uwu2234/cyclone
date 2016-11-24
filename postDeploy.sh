#!/bin/bash
source ~/.bashrc
chmod +x ~/.nvm/nvm.sh
~/.nvm/nvm.sh # Load NVM for christ's sake
export PATH="$PATH:/home/node/.nvm/versions/node/v7.2.0/bin"
npm install
pm2 startOrRestart ecosystem.config.js --env production