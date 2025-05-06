// File: app/api/settings/security/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connect from '@/lib/db';
import User from '@/models/User';

// Connect to the database
connect();

// GET handler to fetch security settings
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

    // Default security settings
    const settings = {
      twoFactorEnabled: user.twoFactorEnabled || false,
      sessionTimeout: user.sessionTimeout || 30,
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching security settings:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT handler to update security settings
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

    // Update security settings
    if (settings.twoFactorEnabled !== undefined) user.twoFactorEnabled = settings.twoFactorEnabled;
    if (settings.sessionTimeout) user.sessionTimeout = settings.sessionTimeout;

    await user.save();

    return NextResponse.json({ 
      message: 'Security settings updated successfully',
      settings: {
        twoFactorEnabled: user.twoFactorEnabled,
        sessionTimeout: user.sessionTimeout,
      }
    });
  } catch (error) {
    console.error('Error updating security settings:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}