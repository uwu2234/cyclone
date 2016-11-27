/**
 * Project............: Cyclone
 * File...............: user-schema.js
 * Author.............: Relative
 * Created on.........: 11/24/2016
 */

const _mongoose = require('mongoose')
const mongoose =  _mongoose.createConnection('admin:XpCdV6K1DWwq4BW0k0l@178.32.177.169/cyclone?authSource=admin&authMechanism=SCRAM-SHA-1')
const userSchema = mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 1000
  },
  warnings: {
    type: Array,
    required: true
  }
})

module.exports = mongoose.model('users', userSchema)