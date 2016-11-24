/**
 * Project............: Cyclone
 * File...............: api
 * Author.............: Relative
 * Created on.........: 11/24/2016
 */
const Users = require('./models/user-schema')

module.exports.init = (bot, callback) => {
  let users = bot.users
  for(let _usr in users.array()){ // Create non-existent users.
    let user = users.array()[_usr]
    Users.find({
      id: user.id
    }).exec((err, keys) => {
      if(err){
        return callback(err)
      }
      if(!keys[0]){
        new Users({
          id: user.id,
          balance: 1000,
          warnings: [{}]
        }).save((err) => {
          if(err){
            return callback(err)
          }
        })
      }
    })
  }
  return callback(null)
}

module.exports.findUserById = (id, callback) => {
  Users.find({
    id: id
  }).exec((err, keys) => {
    if(err){
      return callback(err)
    }
    if(!keys[0]){
      return callback("No user by that ID was found in the database.")
    }
    return callback(null, keys[0])
  })
}

module.exports.getBalance = (id, callback) => {
  module.exports.findUserById(id, (err, _user) => {
    if(err){
      return callback(err)
    }
    return callback(null, _user.balance)
  })
}

module.exports.setBalance = (id, newBalance, callback) => {
  Users.update({id: id}, {balance: newBalance}, (err,raw) => {
    if(err){
      return callback(err)
    }
    return callback(null)
  })
}

module.exports.addBalance = (id, addBalance, callback) => {
  module.exports.getBalance(id, (err,bal) => {
    if(err) {
      return callback(err)
    }
    module.exports.setBalance(id, bal + addBalance, (err) => {
      if(err){
        return callback(err)
      }
      return callback(null)
    })
  })
}

module.exports.subtractBalance = (id, subtBalance, callback) => {
  module.exports.getBalance(id, (err,bal) => {
    if(err) {
      return callback(err)
    }
    module.exports.setBalance(id, bal - subtBalance, (err) => {
      if(err){
        return callback(err)
      }
      return callback(null)
    })
  })
}

module.exports.getWarnings = (id, callback) => {
  module.exports.findUserById(id, (err, user) => {
    if(err){
      return callback(err)
    }
    return callback(null, user.warnings)
  })
}

module.exports.addWarning = (id, warner, reason, callback) => {
  module.exports.getWarnings(id, (err, _warnings) => {
    if(err){
      return callback(err)
    }
    let warnings = _warnings
    warnings.push({
      warner: warner,
      reason: reason
    })
    Users.update({id: id}, {warnings: warnings}, (err,raw) => {
      if(err){
        return callback(err)
      }
      return callback(null)
    })
  })
}

module.exports.clearWarnings = (id, callback) => {
  Users.update({id: id}, {warnings: []}, (err,raw) => {
    if(err){
      return callback(err)
    }
    return callback(null)
  })
}
let digitArray = {
  '0': ':zero:',
  '1': ':one:',
  '2': ':two:',
  '3': ':three:',
  '4': ':four:',
  '5': ':five:',
  '6': ':six:',
  '7': ':seven:',
  '8': ':eight:',
  '9': ':nine:'

}
module.exports.digitsToEmoji = (digit) => {
  let emoji = ''
  for(let i=0;i<digit.length;i++){
    let char = digit.charAt(i)
    emoji += digitArray[char] + ' '
  }
  return emoji
}

