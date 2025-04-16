// app/api/admin/laundry-shops/route.js
import { NextResponse } from 'next/server';
import LaundryShop from '@/models/LaundryShop';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';

// Helper function to check if user is admin
async function isAdmin(req) {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin';
}

// GET all laundry shops
export async function GET(req) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get('isActive');
    const query = {};
    
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }
    
    const laundryShops = await LaundryShop.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ laundryShops }, { status: 200 });
  } catch (error) {
    console.error('Error fetching laundry shops:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create a new laundry shop
export async function POST(req) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const session = await getServerSession(authOptions);

    await dbConnect();
    const data = await req.json();
    
    // Basic validation
    if (!data.name || !data.location || !data.menu || data.menu.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    data.ownerId = session.user.id;
    console.log(session.user.id);
    const newLaundryShop = new LaundryShop(data);
    await newLaundryShop.save();
    
    return NextResponse.json({ laundryShop: newLaundryShop }, { status: 201 });
  } catch (error) {
    console.error('Error creating laundry shop:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
