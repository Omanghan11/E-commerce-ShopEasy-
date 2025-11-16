import { Router } from "express";
import Ticket from "../models/Ticket.js";
import { auth } from "../middleware/auth.js";

const router = Router();

// Create a new ticket (accessible to all users, including blocked ones)
router.post("/create", async (req, res) => {
  try {
    const { userId, userEmail, userName, subject, category, priority, description, isBlocked, blockReason } = req.body;

    if (!userId || !userEmail || !userName || !subject || !category || !description) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Check if blocked user already has an open ticket
    if (isBlocked) {
      const existingTicket = await Ticket.findOne({
        userEmail: userEmail,
        isBlocked: true,
        status: { $in: ["open", "in_progress", "waiting_for_user"] }
      });

      if (existingTicket) {
        return res.status(400).json({ 
          message: "You already have an open support ticket. Please wait for it to be resolved before creating a new one.",
          existingTicketId: existingTicket.ticketId
        });
      }
    }

    const ticket = await Ticket.create({
      userId,
      userEmail,
      userName,
      subject,
      category,
      priority: priority || "medium",
      description,
      isBlocked: isBlocked || false,
      blockReason: blockReason || null,
      messages: [{
        sender: "user",
        senderName: userName,
        senderId: userId,
        message: description,
        timestamp: new Date()
      }]
    });

    res.status(201).json({
      message: "Ticket created successfully",
      ticket: {
        id: ticket._id,
        ticketId: ticket.ticketId,
        subject: ticket.subject,
        status: ticket.status,
        category: ticket.category,
        priority: ticket.priority,
        createdAt: ticket.createdAt
      }
    });
  } catch (err) {
    console.error("Create ticket error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's tickets (for authenticated users)
router.get("/my-tickets", auth, async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user._id })
      .select("-messages")
      .sort({ lastActivity: -1 });

    res.json(tickets);
  } catch (err) {
    console.error("Get user tickets error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single ticket details (for authenticated users)
router.get("/:ticketId", auth, async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const ticket = await Ticket.findOne({
      $or: [
        { _id: ticketId },
        { ticketId: ticketId }
      ],
      userId: req.user._id
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  } catch (err) {
    console.error("Get ticket error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add message to ticket (for authenticated users)
router.post("/:ticketId/message", auth, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const ticket = await Ticket.findOne({
      $or: [
        { _id: ticketId },
        { ticketId: ticketId }
      ],
      userId: req.user._id
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.status === "closed") {
      return res.status(400).json({ message: "Cannot add message to closed ticket" });
    }

    const newMessage = {
      sender: "user",
      senderName: req.user.fullName,
      senderId: req.user._id,
      message: message.trim(),
      timestamp: new Date()
    };

    ticket.messages.push(newMessage);
    
    if (ticket.status === "waiting_for_user") {
      ticket.status = "in_progress";
    }

    await ticket.save();

    res.json({
      message: "Message added successfully",
      newMessage
    });
  } catch (err) {
    console.error("Add message error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Check if blocked user has existing open ticket
router.get("/blocked-user-ticket", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingTicket = await Ticket.findOne({
      userEmail: email,
      isBlocked: true,
      status: { $in: ["open", "in_progress", "waiting_for_user"] }
    }).select("ticketId status createdAt");

    if (existingTicket) {
      return res.json({
        hasOpenTicket: true,
        ticket: existingTicket
      });
    }

    res.json({ hasOpenTicket: false });
  } catch (err) {
    console.error("Check blocked user ticket error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Close ticket (for authenticated users)
router.put("/:ticketId/close", auth, async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const ticket = await Ticket.findOneAndUpdate(
      {
        $or: [
          { _id: ticketId },
          { ticketId: ticketId }
        ],
        userId: req.user._id
      },
      { 
        status: "closed",
        closedAt: new Date()
      },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json({
      message: "Ticket closed successfully",
      ticket
    });
  } catch (err) {
    console.error("Close ticket error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;