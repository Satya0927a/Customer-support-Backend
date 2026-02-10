const express = require('express')
const mongoose = require('mongoose')
const userrouter = require('./controllers/user_cnt');
const errorhandler = require('./middlewares/errorhandler');
const ticketrouter = require('./controllers/ticket_cnt');
const authmiddleware = require('./middlewares/authmiddleware');
const adminrouter = require('./controllers/admin_cnt');
const adminmiddleware = require('./middlewares/adminmiddleware');
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
app.use('/api/ticket',authmiddleware,ticketrouter)
app.use('/api/admin',authmiddleware,adminmiddleware,adminrouter)
app.use(errorhandler)

module.exports = app