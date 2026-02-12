const commentmodel = require('../models/commentmodel')
const ticketmodel = require('../models/ticketmodel')

const agentrouter = require('express').Router()

//?to view what tickets are taken by the agent
agentrouter.get('/ticket/assigned', async (req, res, next) => {
  try {
    const tickets = await ticketmodel.find({ agentIncharge: req.user.userid, status: "processing" })
    if (tickets.length == 0) {
      return res.send({
        success: true,
        message: "You have no pending tickets assigned to you"
      })
    }
    res.send({
      success: true,
      message: "fetched all the tickets",
      tickets: tickets
    })
  } catch (error) {
    next(error)
  }
})
//?to get all the tickets available and filter through them
agentrouter.get('/ticket', async (req, res, next) => {
  try {
    const { by, related, status } = req.query
    const filter = {}
    if (by) filter.raisedBy = by
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
    const ticket = await ticketmodel.findById(ticketId)
    if (!ticket) {
      return res.status(404).send({
        success: false,
        message: "Ticket not found"
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
agentrouter.patch('/ticket/:ticketId', async (req, res, next) => {
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

agentrouter.get('/ticket/assigned/:ticketId', async (req, res, next) => {
  try {
    const ticketId = req.params.ticketId
    const ticket = await ticketmodel.findById(ticketId).populate({ path: 'comments', select: "comment" })
    if (!ticket) {
      return res.status(404).send({
        success: false,
        message: "Ticket not found"
      })
    }
    if (ticket.agentIncharge != req.user.userid) {
      return res.status(404).send({
        success: false,
        message: "ticket not found" //lie
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
//? agent can comment on tickets
agentrouter.post('/ticket/assigned/:ticketId', async (req, res, next) => {
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
    if (ticket.status == "resolved") {
      return res.status(404).send({
        success: false,
        message: "This ticket is closed"
      })
    }
    if (ticket.agentIncharge != req.user.userid) {
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
  } catch (error) {
    next(error)
  }
})
//?to resolve a ticket
agentrouter.patch('/ticket/assigned/:ticketId', async (req, res, next) => {
  try {
    const ticketId = req.params.ticketId
    const ticket = await ticketmodel.findById(ticketId)
    if (!ticket) {
      return res.status(404).send({
        success: false,
        message: "ticket not found"
      })
    }
    if (ticket.agentIncharge != req.user.userid) {
      return res.status(404).send({
        success: false,
        message: "ticket not found" //lie
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