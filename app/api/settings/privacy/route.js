// File: app/api/settings/privacy/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connect from '@/lib/db';
import User from '@/models/User';

// Connect to the database
connect();

// GET handler to fetch privacy settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Default privacy settings
    const settings = {
      profileVisibility: user.profileVisibility || 'public',
      activityTracking: user.activityTracking !== undefined ? user.activityTracking : true,
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT handler to update privacy settings
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const data = await request.json();
    const { settings } = data;

    if (!settings) {
      return NextResponse.json({ message: 'No settings provided' }, { status: 400 });
    }

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Update privacy settings
    if (settings.profileVisibility) user.profileVisibility = settings.profileVisibility;
    if (settings.activityTracking !== undefined) user.activityTracking = settings.activityTracking;

    await user.save();

    return NextResponse.json({ 
      message: 'Privacy settings updated successfully',
      settings: {
        profileVisibility: user.profileVisibility,
        activityTracking: user.activityTracking,
      }
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}