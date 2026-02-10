const mongoose = require('mongoose')

const userschema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
  },
  email:{
    type:String,
    required:true,
    unique:true,
  },
  passwordHash:{
    type:String,
    required:true
  },
  role:{
    type:String,
    enum:['user','admin','agent'],
    default:'user'
  },
  active:{
    type:Boolean,
    default:true
  }
})

const usermodel = new mongoose.model('user',userschema)
module.exports = usermodel