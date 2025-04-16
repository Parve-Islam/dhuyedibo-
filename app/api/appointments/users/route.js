// In /api/appointments/users/route.js
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Appointment from '@/models/Appointment';
import LaundryShop from '@/models/LaundryShop'; // Add this import


export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect ();
    const body = await request.json();
    
    // Create appointment using session user ID
    const newAppointment = await Appointment.create({
      userId: session.user.id, // Get user ID from session
      laundryShopId: body.laundryShopId,
      date: new Date(body.date),
      timeSlot: body.timeSlot,
      status: 'Scheduled'
    });
    
    return NextResponse.json(
      { success: true, data: newAppointment },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    // Get user's appointments
    const appointments = await Appointment.find({ 
      userId: session.user.id 
    }).populate('laundryShopId');
    
    return NextResponse.json({ appointments });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}