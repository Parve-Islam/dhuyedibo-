// app/api/laundry-shops/[id]/route.js
import { NextResponse } from 'next/server';

import LaundryShop from '@/models/LaundryShop';
import dbConnect from '@/lib/dbConnect';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    await dbConnect();
    
    const shop = await LaundryShop.findById(id);
    
    if (!shop) {
      console.log('Laundry shop not found');
      return NextResponse.json({ error: 'Laundry shop not found' }, { status: 404 });
    }
    
    return NextResponse.json({ shop });
  } catch (error) {
    console.error('Error fetching laundry shop details:', error);
    return NextResponse.json({ error: 'Failed to fetch laundry shop details' }, { status: 500 });
  }
}

