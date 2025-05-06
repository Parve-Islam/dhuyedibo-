// app/api/laundry-shops/[id]/reviews/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';
import LaundryShop from '@/models/LaundryShop';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

export async function POST(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'You must be signed in to post a review' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    // Get shop ID from params
    const { id } = params;

    // Validate shop ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid laundry shop ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const { rating, title, comment, serviceType } = await request.json();

    // Validate required fields
    if (!rating || !title || !comment || !serviceType) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate serviceType
    const validServiceTypes = ['Washing', 'Ironing', 'Dry Cleaning', 'Multiple Services'];
    if (!validServiceTypes.includes(serviceType)) {
      return NextResponse.json(
        { error: 'Invalid service type' },
        { status: 400 }
      );
    }

    // Find the laundry shop
    const laundryShop = await LaundryShop.findById(id);
    if (!laundryShop) {
      return NextResponse.json(
        { error: 'Laundry shop not found' },
        { status: 404 }
      );
    }

    // Get user
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has already reviewed this shop
    const existingReviewIndex = laundryShop.reviews.findIndex(
      (review) => review.userId.toString() === session.user.id && !review.isDeleted
    );

    if (existingReviewIndex !== -1) {
      // Update existing review
      laundryShop.reviews[existingReviewIndex].rating = rating;
      laundryShop.reviews[existingReviewIndex].title = title;
      laundryShop.reviews[existingReviewIndex].comment = comment;
      laundryShop.reviews[existingReviewIndex].serviceType = serviceType;
      laundryShop.reviews[existingReviewIndex].updatedAt = new Date();
      
      // Update the corresponding rating in the ratings array
      laundryShop.ratings[existingReviewIndex] = rating;
    } else {
      // Create new review
      const newReview = {
        userId: session.user.id,
        rating,
        title,
        comment,
        serviceType,
        likes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerified: false,
        isOwnerResponded: false,
        isDeleted: false
      };

      laundryShop.reviews.push(newReview);
      laundryShop.ratings.push(rating);
    }

    // Save the laundry shop with the updated reviews
    await laundryShop.save();

    return NextResponse.json(
      { success: true, message: 'Review submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error posting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

// GET route to fetch reviews for a specific laundry shop
export async function GET(request, { params }) {
  try {
    // Connect to MongoDB
    await dbConnect();

    const { id } = params;

    // Validate shop ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid laundry shop ID' },
        { status: 400 }
      );
    }

    // Find the laundry shop
    const laundryShop = await LaundryShop.findById(id)
      .populate('reviews.userId', 'name email image')
      .exec();

    if (!laundryShop) {
      return NextResponse.json(
        { error: 'Laundry shop not found' },
        { status: 404 }
      );
    }

    // Filter out deleted reviews and format them for client
    const reviews = laundryShop.reviews
      .filter(review => !review.isDeleted)
      .map(review => ({
        _id: review._id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        serviceType: review.serviceType,
        likes: review.likes,
        user: review.userId ? {
          id: review.userId._id,
          name: review.userId.name,
          email: review.userId.email,
          image: review.userId.image
        } : null,
        isOwnerResponded: review.isOwnerResponded,
        ownerResponse: review.ownerResponse,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      }))
      // Sort reviews by most recent first
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}