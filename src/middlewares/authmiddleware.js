const jwt = require('jsonwebtoken')
const usermodel = require('../models/usermodel')

const authmiddleware = async(req,res,next)=>{
  try {
    const authorization = req.headers.authorization
    if(!authorization){
      return res.status(400).send({
        success:false,
        message:"authorization token is required for this route"
      })
    }
    const token = authorization.replace('Bearer ','')
    const payload = jwt.verify(token,process.env.SECRET)
    const usercheck = await usermodel.findById(payload.userid)
    if(!usercheck){
      return res.status(401).send({
        success:false,
        message:"User not found"
      })
    }
    if(!usercheck.active){
      return res.status(401).send({
        success:false,
        message:"Your account is deactivated"
      })
    }
    req.user = {
      userid:payload.userid,
      role:usercheck.role
    }
    next()
  } catch (error) {
    next(error)
  }
}
module.exports = authmiddleware