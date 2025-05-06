// app/api/laundry-shops/[id]/reviews/[reviewId]/like/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import LaundryShop from '@/models/LaundryShop';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

// POST handler to like/unlike a review
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    await dbConnect();
    const { id, reviewId } = params;
    
    // Validate MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    const shop = await LaundryShop.findById(id);
    
    if (!shop) {
        console.log('Laundry shop not found');
      return NextResponse.json({ error: 'Laundry shop not found' }, { status: 404 });
    }
    
    // Find the review
    const reviewIndex = shop.reviews.findIndex(
      (review) => review._id.toString() === reviewId && !review.isDeleted
    );
    
    if (reviewIndex === -1) {
        console.log('Review not found');
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    
    const userId = session.user.id;
    
    // Initialize likes array if it doesn't exist
    if (!shop.reviews[reviewIndex].likes) {
      shop.reviews[reviewIndex].likes = [];
    }
    
    // Check if user has already liked this review
    const likeIndex = shop.reviews[reviewIndex].likes.findIndex(
      (id) => id.toString() === userId
    );
    
    if (likeIndex === -1) {
      // Add like
      shop.reviews[reviewIndex].likes.push(userId);
    } else {
      // Remove like (unlike)
      shop.reviews[reviewIndex].likes.splice(likeIndex, 1);
    }
    
    await shop.save();
    
    return NextResponse.json({ 
      message: 'Review like updated successfully',
      likes: shop.reviews[reviewIndex].likes
    });
  } catch (error) {
    console.error('Error liking review:', error);
    return NextResponse.json({ error: 'Failed to update review like' }, { status: 500 });
  }
}