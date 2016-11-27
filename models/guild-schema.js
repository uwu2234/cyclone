/**
 * Project............: Cyclone
 * File...............: guild-schema.js
 * Author.............: Relative
 * Created on.........: 11/26/2016
 */

const _mongoose = require('mongoose')
const mongoose =  _mongoose.createConnection('admin:XpCdV6K1DWwq4BW0k0l@178.32.177.169/cyclone?authSource=admin&authMechanism=SCRAM-SHA-1')
const guildSchema = mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  config: {
    type: Object,
    required: true,
    default: {
      prefix: '!',
      unknownCommand: true
    }
  },
  admins: {
    type: Object,
    required: true,
    default: {}
  }
})

module.exports = mongoose.model('guilds', guildSchema)