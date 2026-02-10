const isValidEmail = require("../utils/functions/emailvalidate")

const userinputvalidate = (req, res, next) => {
  try {
    const { name, email, password } = req.body
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
    next()
  } catch (error) {
    next()
  }
}
module.exports = userinputvalidate