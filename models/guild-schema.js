/**
 * Project............: Cyclone
 * File...............: guild-schema.js
 * Author.............: Relative
 * Created on.........: 11/26/2016
 */

const mongoose = require('mongoose')
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