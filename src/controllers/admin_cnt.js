const bcrypt = require('bcrypt')
const userinputvalidate = require('../middlewares/userinputvalidator')
const usermodel = require('../models/usermodel')
const adminrouter = require('express').Router()

//?to create role based accounts
adminrouter.post('/register', userinputvalidate, async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body
    if (!name || !email || !password || !role) {
      return res.status(400).send({
        success: false,
        message: "Invalid inputs"
      })
    }
    const usercheck = await usermodel.findOne({ email: email })
    if (usercheck) {
      return res.status(403).send({
        success: false,
        message: "this email is already linked to an existing account"
      })
    }
    const passhash = await bcrypt.hash(password, 10)
    const newuser = new usermodel({ name: name, email: email, passwordHash: passhash, role: role })
    await newuser.save()
    res.status(201).send({
      success: true,
      message: "successfully created the account",
      userdata: {
        name: newuser.name,
        email: newuser.email,
        role: newuser.role,
        active: newuser.active
      }
    })
  } catch (error) {
    next(error)
  }
})
//?to fetch accounts based on filters
adminrouter.get('/user', async (req, res, next) => {
  try {
    const { role, email, name } = req.query
    const filter = {}
    if (role) {
      if(!['user','admin','agent'].includes(role)){
        return res.status(400).send({
          success:false,
          message:"Invalid role value"
        })
      }
      filter.role = role

    }
    if (email) filter.email = email
    if (name) filter.name = {
      $regex: `^${name}`,
      $options:"i"
    }
    const allusers = await usermodel.find(filter).select('-passwordHash -__v')
    if (allusers.length == 0) {
      return res.status(404).send({
        success: false,
        message: "no user found"
      })
    }
    res.send(allusers)
  } catch (error) {
    next(error)
  }
})
//?deactivate or activate accounts
adminrouter.patch('/user/:userId',async(req,res,next)=>{
  try {
    const userId = req.params.userId
    const user = await usermodel.findById(userId)
    if(!user){
      return res.status(404).send({
        success:false,
        message:"User not found"
      })
    }
    if(user.role == 'admin'){
      return res.status(403).send({
        success:false,
        message:"cannot deactivate an admin account"
      })
    }
    user.active = !user.active
    await user.save()
    if(user.active){
      return res.send({
        success:true,
        message:"activated the account"
      })
    }
    else{
      return res.send({
        success:true,
        message:"deactivated the account"
      })
    }
  } catch (error) {
    next(error)
  }
})
module.exports = adminrouter