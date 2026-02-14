const mongoose = require('mongoose')

const tickeschema = new mongoose.Schema({
  raisedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user',
    required:true
  },
  context:{
    type:String,
    required:true
  },
  related:{
    type:String,
    enum:['payment','account','service','other'],
    required:true,
    index:true
  },
  comments:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'comment'
  }],
  status:{
    type:String,
    enum:['pending','processing','resolved','cancelled'],
    default:'pending',
    index:true
  },
  agentIncharge:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user',
  },
  agentHistory:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user',
  }],
  rating:{
    type:String,
    enum:[1,2,3,4,5],
  }

},{timestamps:true})

const ticketmodel = new mongoose.model('ticket',tickeschema)

module.exports = ticketmodel