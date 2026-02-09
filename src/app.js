const express = require('express')
const app = express()

app.get('/',(req,res)=>{
  res.send("welcome to the customer support backend")
})

module.exports = app