const userinputvalidate = require('../middlewares/userinputvalidator')
const ticketmodel = require('../models/ticketmodel')

const ticketrouter = require('express').Router()

//!temporary route for dev
ticketrouter.get('/all', async (req, res, next) => {
  try {
    const alltickets = await ticketmodel.find({})
    return res.send(alltickets)
  } catch (error) {
    next(error)
  }
})
ticketrouter.get('/', async (req, res, next) => {
  try {
    const userid = req.user.userid
    const usertickets = await ticketmodel.find({ raisedBy: userid }).select('-__v -raisedBy')
    if (!usertickets) {
      return res.send({
        success: true,
        message: "No tickets are raised by you"
      })
    }
    res.send({
      success: true,
      message: "fetched all the tickets",
      tickets: usertickets
    })
  } catch (error) {
    next(error)
  }
})
ticketrouter.post('/', userinputvalidate, async (req, res, next) => {
  try {
    const { context, related } = req.body
    if (!context || !related) {
      return res.status(400).send({
        success: false,
        message: "Invalid inputs"
      })
    }
  
    const newticket = new ticketmodel({ raisedBy: req.user.userid, context: context, related: related })
    await newticket.save()
    res.status(201).send({
      success: true,
      message: "created new ticket",
      newticket: {
        _id: newticket._id,
        context: newticket.context,
        related: newticket.related,
        status: newticket.status,
        comments: newticket.comments
      }
    })
  } catch (error) {
    next(error)
  }
})
module.exports = ticketrouter