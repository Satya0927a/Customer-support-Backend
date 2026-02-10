const isValidEmail = require("../utils/functions/emailvalidate")

const userinputvalidate = (req, res, next) => {
  try {
    const { name, email, password ,context,related} = req.body
    if (name && name.length < 3) {
      return res.status(403).send({
        success: false,
        message: "Name should be atleast 3 char long"
      })
    }
    if (email && !isValidEmail(email)) {
      return res.status(403).send({
        success: false,
        message: "Invalid email format"
      })
    }
    if (password && password.length < 8) {
      return res.status(403).send({
        success: false,
        message: "Password should be atleast 8 char long"
      })
    }
    if (context && context.length < 20) {
      return res.status(400).send({
        success: false,
        message: "context cannot be less than 20 char, explain properly"
      })
    }
    if (related && !['payment', 'account', 'service', 'other'].includes(related)) {
      return res.status(400).send({
        success: false,
        message: "the value of the related field should be among ['payment','account','service','other']"
      })
    }
    next()
  } catch (error) {
    next()
  }
}
module.exports = userinputvalidate