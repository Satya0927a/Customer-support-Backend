const commentmodel = require('../models/commentmodel')
const ticketmodel = require('../models/ticketmodel')

const agentrouter = require('express').Router()


//?to get all the tickets available and filter through them
agentrouter.get('/ticket', async (req, res, next) => {
  try {
    const { by, related, status, assigned } = req.query
    const filter = {}
    if (by) filter.raisedBy = by
    if (assigned == "true") {
      filter.agentIncharge = req.user.userid
    }
    if (related) {
      if (!['payment', 'service', 'account', 'other'].includes(related)) {
        return res.status(400).send({
          success: false,
          message: "related field should have value among ['payment','service','account','other']"
        })
      }
      filter.related = related
    }
    if (status) {
      if (!['pending', 'processing', 'resolved', 'cancelled'].includes(status)) {
        return res.status(400).send({
          success: false,
          message: "related field should have value among ['pending','processing','resolved']"
        })
      }
      filter.status = status
    }
    const tickets = await ticketmodel.find(filter).select('-__v -agentHistory -comments')
    if (tickets.length == 0) {
      return res.status(404).send({
        success: false,
        message: "ticket for this filter not found"
      })
    }
    res.send({
      success: true,
      message: "ticket fetched",
      tickets: tickets
    })
  } catch (error) {
    next(error)
  }
})
//?to get the detail of a specific ticket
agentrouter.get('/ticket/:ticketId', async (req, res, next) => {
  try {
    const ticketId = req.params.ticketId
    const { assigned } = req.query
    const ticket = await ticketmodel.findById(ticketId).populate([{ path: 'comments', select: 'comment by' }, { path: 'agentHistory', select: 'name' }, { path: 'raisedBy', select: 'name email' }])
    if (!ticket) {
      return res.status(404).send({
        success: false,
        message: "Ticket not found"
      })
    }
    if (assigned == "true" && ticket.agentIncharge != req.user.userid) {
      return res.status(404).send({
        success: false,
        message: "This ticket is not assigned to you"
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
//?to take a ticket
agentrouter.patch('/ticket/:ticketId/assign', async (req, res, next) => {
  try {
    const ticketId = req.params.ticketId
    const ticket = await ticketmodel.findById(ticketId)
    if (!ticket) {
      return res.status(404).send({
        success: false,
        message: "ticket not found"
      })
    }
    if (ticket.status == "resolved") {
      return res.status(403).send({
        success: false,
        message: "this token is resolved"
      })
    }
    if (ticket.agentIncharge && ticket.agentIncharge == req.user.userid) {
      return res.status(403).send({
        success: false,
        message: "you are already incharge of this ticket"
      })
    }
    else if (ticket.agentIncharge && ticket.agentIncharge != req.user.userid) {
      return res.status(403).send({
        success: false,
        message: "an agent is already incharge of this ticket"
      })
    }
    const agentpendingtickets = await ticketmodel.find({ agentIncharge: req.user.userid, status: "pending" })
    if (agentpendingtickets.length > 1) {
      return res.status(403).send({
        success: false,
        message: `you already have ${agentpendingtickets.length} tickets in pending.`
      })
    }
    ticket.agentIncharge = req.user.userid
    ticket.agentHistory.push(req.user.userid)
    ticket.status = "processing"
    await ticket.save()
    res.send({
      success: true,
      message: "you have been given incharge of this ticket"
    })
  } catch (error) {
    next(error)
  }
})

//? agent can comment on tickets
agentrouter.post('/ticket/:ticketId/comment', async (req, res, next) => {
  try {
    const { comment } = req.body
    if (!comment) {
      return res.status(400).send({
        success: false,
        message: "invalid input"
      })
    }
    const ticketId = req.params.ticketId
    const ticket = await ticketmodel.findById(ticketId)
    if (!ticket) {
      return res.status(404).send({
        success: false,
        message: "ticket not found"
      })
    }
    if (ticket.status == "resolved" || ticket.status == "cancelled") {
      return res.status(403).send({
        success: false,
        message: `This ticket is ${ticket.status}`
      })
    }
    if (ticket.agentIncharge != req.user.userid) {
      return res.status(404).send({
        success: false,
        message: "You are not assigned to this ticket"
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
  } catch (error) {
    next(error)
  }
})
//?to resolve a ticket
agentrouter.patch('/ticket/:ticketId/status', async (req, res, next) => {
  try {
    const ticketId = req.params.ticketId
    const ticket = await ticketmodel.findById(ticketId)
    if (!ticket) {
      return res.status(404).send({
        success: false,
        message: "ticket not found"
      })
    }
    if (ticket.status == "resolved" || ticket.status == "cancelled") {
      return res.status(403).send({
        success: false,
        message: `This ticket is ${ticket.status}`
      })
    }
    if (ticket.agentIncharge != req.user.userid) {
      return res.status(404).send({
        success: false,
        message: "This is ticket is not assigned to you"
      })
    }
    ticket.status = "resolved"
    ticket.agentIncharge = null
    ticket.save()
    res.send({
      success: true,
      message: "successfully closed the ticket"
    })
  } catch (error) {
    next(error)
  }
})
module.exports = agentrouter