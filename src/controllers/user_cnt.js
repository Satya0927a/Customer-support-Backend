const userinputvalidate = require('../middlewares/userinputvalidator')
const commentmodel = require('../models/commentmodel')
const ticketmodel = require('../models/ticketmodel')

const userrouter = require('express').Router()

//?to get all ticket raised by the user
userrouter.get('/ticket', async (req, res, next) => {
  try {
    const userid = req.user.userid
    const usertickets = await ticketmodel.find({ raisedBy: userid }).select('-__v -raisedBy -comments -agentHistory -agentIncharge -user_satisfaction')
    if (usertickets.length == 0) {
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
//? right now user can only fetch data for their raised token in this route
userrouter.get('/ticket/:ticketid', async (req, res, next) => {
  try {
    const ticketid = req.params.ticketid
    let ticket = await ticketmodel.findById(ticketid).populate([{ path: "agentIncharge agentHistory", select: "name -_id" }, { path: "comments", select: "comment" }]).select('-__v')
    if (ticket.raisedBy != req.user.userid) {
      return res.status(404).send({
        success: false,
        message: "ticket not found" //a lie
      })
    }
    res.send({
      success: true,
      message: "fetched the ticket",
      ticket: ticket
    })
  } catch (error) {
    next(error)
  }
})
//?creating a ticket
userrouter.post('/ticket', userinputvalidate, async (req, res, next) => {
  try {
    const { context, related } = req.body
    if (!context || !related) {
      return res.status(400).send({
        success: false,
        message: "Invalid inputs"
      })
    }
    const pendingticket = await ticketmodel.find({ raisedBy: req.user.userid, status: "pending" })
    if (pendingticket.length >= 2) {
      return res.status(403).send({
        success: false,
        message: "you already have 2 pending tickets you cannot create more without cancelling one"
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
        createdAt: newticket.createdAt,
      }
    })
  } catch (error) {
    next(error)
  }
})
//?for cancelling a ticket 
userrouter.patch('/ticket/:ticketId', async (req, res, next) => {
  try {
    const ticketId = req.params.ticketId
    const ticket = await ticketmodel.findById(ticketId)
    if (!ticket) {
      return res.status(404).send({
        success: false,
        message: "Ticket not found"
      })
    }
    if (ticket.raisedBy != req.user.userid) {
      return res.status(404).send({
        success: false,
        message: "Ticket not found" //lie
      })
    }
    if (ticket.status == "resolved" || ticket.status == "cancelled") {
      return res.status(400).send({
        success: false,
        message: "Bad request"
      })
    }
    await ticketmodel.findByIdAndUpdate(ticketId, { "status": "cancelled" })
    res.send({
      success: true,
      message: "Cancelled the ticket"
    })
  } catch (error) {
    next(error)
  }
})
//?commenting on ticket
userrouter.post('/ticket/:ticketId', async (req, res, next) => {
  const ticketId = req.params.ticketId
  const { comment } = req.body
  if (!comment) {
    return res.status(400).send({
      success: false,
      message: "invalid input"
    })
  }
  const ticket = await ticketmodel.findById(ticketId)
  if (!ticket) {
    return res.status(404).send({
      success: false,
      message: "ticket not found"
    })
  }
  if (ticket.raisedBy != req.user.userid) {
    return res.status(404).send({
      success: false,
      message: "ticket not found" //lie
    })
  }
  const newcomment = new commentmodel({ ticket: ticketId, comment: comment, by: req.user.userid })
  await newcomment.save()
  ticket.comments.push(newcomment._id)
  await ticket.save()
  res.status(201).send({
    success: true,
    message: "posted new comment",
    newcomment: newcomment
  })
})
module.exports = userrouter