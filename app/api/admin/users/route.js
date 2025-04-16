// File: app/api/admin/users/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
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
    
    // Connect to the database
    await dbConnect();
    
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const role = searchParams.get("role") || "";
    const search = searchParams.get("search") || "";
    const verificationStatus = searchParams.get("verificationStatus") || "";
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build query
    const query = { deleted: false };
    
    // Add role filter if specified
    if (role) {
      query.role = role;
    }
    
    // Add verification status filter if specified
    if (verificationStatus === "verified") {
      query.isVerified = true;
    } else if (verificationStatus === "unverified") {
      query.isVerified = false;
    }
    
    // Add search filter if specified
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    
    // Build sort configuration
    const sortConfig = {};
    sortConfig[sortField] = sortOrder === "asc" ? 1 : -1;
    
    // Fetch users with pagination and sorting
    const users = await User.find(query)
      .sort(sortConfig)
      .skip(skip)
      .limit(limit)
      .select("-password -resetToken -otp -otpExpiry -resetTokenExpiry")
      .lean();
    
    // Get total count for pagination
    const totalUsers = await User.countDocuments(query);
    
    // Get count of admins and regular users
    const adminCount = await User.countDocuments({ role: "admin", deleted: false });
    const userCount = await User.countDocuments({ role: "user", deleted: false });
    const verifiedCount = await User.countDocuments({ isVerified: true, deleted: false });
    const unverifiedCount = await User.countDocuments({ isVerified: false, deleted: false });
    
    return NextResponse.json({
      users,
      pagination: {
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit),
        page,
        limit,
      },
      counts: {
        admin: adminCount,
        user: userCount,
        verified: verifiedCount,
        unverified: unverifiedCount,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}