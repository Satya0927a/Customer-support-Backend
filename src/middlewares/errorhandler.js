const errorhandler = (err,req,res,next)=>{
  console.log(err.name);
  console.log(err);
  if(err.name == "JsonWebTokenError"){
    return res.status(401).send({
      success:false,
      message:"Invalid Token"
    })
  }
  else if(err.name == 'TokenExpiredError'){
    return res.status(401).send({
      success:false,
      message:"Session expired login again"
    })
  }
  else{
    res.status(500).send({
      success:false,
      message:"Server error"
    })
  }
}
module.exports = errorhandler