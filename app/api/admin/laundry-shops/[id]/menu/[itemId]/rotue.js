
// app/api/admin/laundry-shops/[id]/menu/[itemId]/route.js
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

// PUT update a specific menu item
export async function PUT(req, { params }) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, itemId } = params;
    
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid shop ID' }, { status: 400 });
    }
    
    await connectDB();
    const menuItemUpdate = await req.json();
    
    const shop = await LaundryShop.findById(id);
    
    if (!shop) {
      return NextResponse.json({ error: 'Laundry shop not found' }, { status: 404 });
    }
    
    // Find the menu item index
    const menuItemIndex = shop.menu.findIndex(item => item._id.toString() === itemId);
    
    if (menuItemIndex === -1) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }
    
    // Update the menu item
    Object.assign(shop.menu[menuItemIndex], menuItemUpdate);
    await shop.save();
    
    return NextResponse.json({ 
      message: 'Menu item updated',
      menuItem: shop.menu[menuItemIndex]
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE a specific menu item
export async function DELETE(req, { params }) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, itemId } = params;
    
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid shop ID' }, { status: 400 });
    }
    
    await connectDB();
    
    const updatedShop = await LaundryShop.findByIdAndUpdate(
      id,
      { $pull: { menu: { _id: itemId } } },
      { new: true }
    );
    
    if (!updatedShop) {
      return NextResponse.json({ error: 'Laundry shop not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: 'Menu item deleted',
      menu: updatedShop.menu
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}