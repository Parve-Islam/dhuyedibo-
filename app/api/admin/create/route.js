// File: app/api/admin/create/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from 'bcrypt';

export async function POST(req) {
  try {
    // Get the session to verify the requester is an admin
    const session = await getServerSession(authOptions);
    
    // Check if the user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin privileges required" },
        { status: 403 }
      );
    }
    
    // Get the form data
    const data = await req.json();
    const { name, email, password, generateRandomPassword } = data;
    
    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await dbConnect();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }
    
    
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new admin user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      profilePicture: "",

      role: "admin",
      isVerified: true, // Admin users are created as verified
    });
    
    await newUser.save();
    const salt = await bcrypt.genSalt(10);
    const saltedPassword = await bcrypt.hash(password, salt);
    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      isVerified: true,
      password: password,
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Failed to create admin user" },
      { status: 500 }
    );
  }
}