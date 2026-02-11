const mongoose = require('mongoose')

const commentschema = new mongoose.Schema({
  ticket:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'ticket',
    required:true
  },
  comment:{
    type:String,
    required:true
  },
  by:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user',
    required:true
  }
})

const commentmodel = new mongoose.model('comment',commentschema)

module.exports = commentmodel