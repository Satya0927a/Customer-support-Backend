const usermiddleware = (req,res,next)=>{
  if(req.user.role != "user"){
    return res.status(403).send({
      success:false,
      message:"you dont have access to this route"
    })
  }
  next()
}
module.exports = usermiddleware
