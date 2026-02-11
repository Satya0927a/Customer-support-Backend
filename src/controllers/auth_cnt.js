const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const userinputvalidate = require('../middlewares/userinputvalidator')
const usermodel = require('../models/usermodel')

const authrouter = require('express').Router()

//!temp dev route
authrouter.get('/all',async(req,res,next)=>{
  try {
    const alluser = await usermodel.find({})
    res.send(alluser)
  } catch (error) {
    next(error)
  }
})
authrouter.post('/register',userinputvalidate,async(req,res,next)=>{
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
authrouter.post('/login',userinputvalidate,async(req,res,next)=>{
  const {email,password} = req.body
  if(!email || !password){
    return res.status(400).send({
      success:false,
      message:"Invalid inputs"
    })
  }
  const user = await usermodel.findOne({email:email})
  if(!user){
    return res.status(404).send({
      success:false,
      message:"Invalid credentials"
    })
  }
  if(!user.active){
    return res.status(403).send({
      success:false,
      message:"Your account is deactive"
    })
  }
  const passverify = await bcrypt.compare(password,user.passwordHash)
  if(!passverify){
    return res.status(404).send({
      success:false,
      message:"Invalid credentials"
    })
  }
  const payload = {
    userid:user._id
  }
  const token = jwt.sign(payload,process.env.SECRET,{expiresIn:'40m'})
  res.send({
    success:true,
    message:"logged in successfully",
    userdata:{
      name:user.name,
      email:user.email,
      role:user.role,
      token:token
    }
  })

})

module.exports = authrouter