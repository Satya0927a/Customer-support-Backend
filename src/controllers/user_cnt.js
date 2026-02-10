const bcrypt = require('bcrypt')
const userinputvalidate = require('../middlewares/userinputvalidator')
const usermodel = require('../models/usermodel')

const userrouter = require('express').Router()

userrouter.get('/all',async(req,res,next)=>{
  try {
    const alluser = await usermodel.find({})
    res.send(alluser)
  } catch (error) {
    next(error)
  }
})
userrouter.post('/register',userinputvalidate,async(req,res,next)=>{
  try {
    const {name,email,password} = req.body
    if(!name || !email ||!password){
      return res.status(400).send({
        success:false,
        message:"Invalid inputs"
      })
    }
    const usercheck = await usermodel.findOne({email:email})
    if(usercheck){
      return res.status(403).send({
        success:false,
        message:"This email is already linked to an account"
      })
    }
    const passhash = await bcrypt.hash(password,10)
    const newuser = new usermodel({name:name,email:email,passwordHash:passhash})
    await newuser.save()
    res.status(201).send({
      success:true,
      message:"successfully created the account",
      userdata:{
        _id:newuser._id,
        name:newuser.name,
        email:newuser.email,
        role:newuser.role,
        active:newuser.active
      }
    })
  } catch (error) {
    next(error)
  }
})

module.exports = userrouter