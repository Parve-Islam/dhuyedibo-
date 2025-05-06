import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Review from '@/models/Review';
import Order from '@/models/Order';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { orderId, rating, comment } = await request.json();

    // Verify order belongs to user
    const order = await Order.findOne({
      _id: orderId,
      userId: session.user.id
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const review = new Review({
      userId: session.user.id,
      orderId,
      laundryShopId: order.laundryShopId,
      rating,
      comment
    });

    await review.save();

    return NextResponse.json({ success: true, review });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}