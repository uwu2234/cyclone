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
  prefix: {
    type: String,
    required: true,
    default: '!'
  },
  unknownCommand: {
    type: Boolean,
    required: true,
    default: true
  },
  admins: {
    type: Array,
    required: true,
    default: []
  }
})

module.exports = mongoose.model('users', userSchema)