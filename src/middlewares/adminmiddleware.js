const adminmiddleware = async(req,res,next)=>{
  try {
    const role = req.user.role
    if(role != "admin"){
      return res.status(403).send({
        success:false,
        message:"You dont have access to this route"
      })
    }
    next()
  } catch (error) {
    next(error)
  }
}
module.exports = adminmiddleware