const errorhandler = (err,req,res,next)=>{
  console.log(err.name);
  console.log(err);
  res.status(500).send({
    success:false,
    message:"Server error"
  })
  
}
module.exports = errorhandler