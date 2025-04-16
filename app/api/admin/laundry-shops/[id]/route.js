import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import LaundryShop from '@/models/LaundryShop';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper function to check if user is admin
async function isAdmin(req) {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin';
}

// GET a specific laundry shop
export async function GET(req, { params }) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid shop ID' }, { status: 400 });
    }
    
    await dbConnect();
    const laundryShop = await LaundryShop.findById(id);
    
    if (!laundryShop) {
      return NextResponse.json({ error: 'Laundry shop not found' }, { status: 404 });
    }
    
    return NextResponse.json({ laundryShop }, { status: 200 });
  } catch (error) {
    console.error('Error fetching laundry shop:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT update a laundry shop
export async function PUT(req, { params }) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid shop ID' }, { status: 400 });
    }
    
    await dbConnect(); // Fixed: Changed dbconnect to dbConnect
    const data = await req.json();
    
    const updatedLaundryShop = await LaundryShop.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!updatedLaundryShop) {
      return NextResponse.json({ error: 'Laundry shop not found' }, { status: 404 });
    }
    
    return NextResponse.json({ laundryShop: updatedLaundryShop }, { status: 200 });
  } catch (error) {
    console.error('Error updating laundry shop:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE a laundry shop
export async function DELETE(req, { params }) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid shop ID' }, { status: 400 });
    }
    
    await dbConnect();
    
    // Instead of hard deleting, just set isActive to false
    const deactivatedShop = await LaundryShop.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );
    
    if (!deactivatedShop) {
      return NextResponse.json({ error: 'Laundry shop not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Laundry shop deactivated' }, { status: 200 });
  } catch (error) {
    console.error('Error deactivating laundry shop:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}