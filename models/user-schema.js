/**
 * Project............: Cyclone
 * File...............: user-schema.js
 * Author.............: Relative
 * Created on.........: 11/24/2016
 */

const mongoose = require('mongoose')
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