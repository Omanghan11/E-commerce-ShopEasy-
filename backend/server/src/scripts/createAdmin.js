import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { connectDB } from "../db.js";

const createAdminUser = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@shopeasy.com',
      phone: '+1234567890',
      passwordHash,
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@shopeasy.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();