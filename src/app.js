const express = require('express')
const mongoose = require('mongoose')
const userrouter = require('./controllers/user_cnt');
const errorhandler = require('./middlewares/errorhandler');
const app = express()

if(mongoose.connect(process.env.MONGO_URI)){
  console.log("connected to the database");
}
else{
  console.log("couldnt connect to the database");
}
app.use(express.json())
app.get('/',(req,res)=>{
  res.send("welcome to the customer support backend")
})
app.use('/api/user',userrouter)
app.use(errorhandler)

module.exports = app