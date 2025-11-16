import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { 
    type: String, 
    enum: ["user", "admin"], 
    required: true 
  },
  senderName: { 
    type: String, 
    required: true 
  },
  senderId: { 
    // Set to String to allow both real IDs and temporary ones
    type: String, 
    ref: 'User', 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number
  }]
}, { timestamps: true });

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    // FIX: Remove 'required: true' from here
  },
  userId: {
    // Set to String to allow both real IDs and temporary ones
    type: String,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ["account_blocked", "technical_issue", "billing", "general_inquiry", "bug_report", "feature_request"],
    required: true
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },
  status: {
    type: String,
    enum: ["open", "in_progress", "waiting_for_user", "resolved", "closed"],
    default: "open"
  },
  description: {
    type: String,
    required: true
  },
  messages: [messageSchema],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedToName: {
    type: String
  },
  tags: [String],
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockReason: {
    type: String
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  },
  closedAt: {
    type: Date
  }
}, { timestamps: true });

// This hook will now run correctly and ensure the ticketId exists
ticketSchema.pre('save', async function(next) {
  if (!this.ticketId) {
    // A safer way to reference the model
    const count = await this.constructor.countDocuments();
    this.ticketId = `TKT-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

ticketSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.lastActivity = new Date();
  }
  next();
});

export default mongoose.model("Ticket", ticketSchema, "tickets");