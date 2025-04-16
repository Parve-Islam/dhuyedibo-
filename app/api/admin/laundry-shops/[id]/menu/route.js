
// app/api/admin/laundry-shops/[id]/menu/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import LaundryShop from '@/models/LaundryShop';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper function to check if user is admin
async function isAdmin(req) {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin';
}

// GET the menu of a specific laundry shop
export async function GET(req, { params }) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid shop ID' }, { status: 400 });
    }
    
    await connectDB();
    const laundryShop = await LaundryShop.findById(id, 'menu');
    
    if (!laundryShop) {
      return NextResponse.json({ error: 'Laundry shop not found' }, { status: 404 });
    }
    
    return NextResponse.json({ menu: laundryShop.menu }, { status: 200 });
  } catch (error) {
    console.error('Error fetching laundry shop menu:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST add a new menu item
export async function POST(req, { params }) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid shop ID' }, { status: 400 });
    }
    
    await connectDB();
    const menuItem = await req.json();
    
    // Basic validation
    if (!menuItem.name || !menuItem.price || !menuItem.category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const updatedShop = await LaundryShop.findByIdAndUpdate(
      id,
      { $push: { menu: menuItem } },
      { new: true }
    );
    
    if (!updatedShop) {
      return NextResponse.json({ error: 'Laundry shop not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: 'Menu item added', 
      menu: updatedShop.menu 
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding menu item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
