// File: app/api/settings/account/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connect from '@/lib/db';
import User from '@/models/User';

// Connect to the database
connect();

// GET handler to fetch account settings
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

    // Default account settings
    const settings = {
      language: user.language || 'en',
      timezone: user.timezone || 'UTC',
      currency: user.currency || 'USD',
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching account settings:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT handler to update account settings
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

    // Update account settings
    if (settings.language) user.language = settings.language;
    if (settings.timezone) user.timezone = settings.timezone;
    if (settings.currency) user.currency = settings.currency;

    await user.save();

    return NextResponse.json({ 
      message: 'Account settings updated successfully',
      settings: {
        language: user.language,
        timezone: user.timezone,
        currency: user.currency,
      }
    });
  } catch (error) {
    console.error('Error updating account settings:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}