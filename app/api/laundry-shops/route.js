// app/api/laundry-shops/route.js
import { NextResponse } from 'next/server';

import LaundryShop from '@/models/LaundryShop';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    await dbConnect();
    
    let query = { isActive: true };
    
    // Add filters if provided
    if (category) {
      query['menu.category'] = category;
    }
    
    // If location is provided, we can later implement geo-based search
    // This would require additional frontend work to get user coordinates
    
    const totalShops = await LaundryShop.countDocuments(query);
    const shops = await LaundryShop.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      shops, 
      pagination: {
        total: totalShops,
        page,
        limit,
        pages: Math.ceil(totalShops / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching laundry shops:', error);
    return NextResponse.json({ error: 'Failed to fetch laundry shops' }, { status: 500 });
  }
}
