// app/api/appointments/route.js
import { NextResponse } from 'next/server';
import Appointment from '@/models/Appointment';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const appointments = await Appointment.find({ userId: session.user.id })
      .populate('laundryShopId', 'name location')
      .sort({ date: -1 });
    
    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { laundryShopId, date, timeSlot } = await request.json();
    
    if (!laundryShopId || !date || !timeSlot) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    await dbConnect();
    
    // Check if the appointment slot is available
    const existingAppointment = await Appointment.findOne({
      laundryShopId,
      date: new Date(date),
      timeSlot,
      status: { $ne: 'Cancelled' }
    });
    
    if (existingAppointment) {
      return NextResponse.json({ error: 'This time slot is already booked' }, { status: 409 });
    }
    
    const newAppointment = new Appointment({
      userId: session.user.id,
      laundryShopId,
      date: new Date(date),
      timeSlot,
      status: 'Scheduled'
    });
    
    await newAppointment.save();
    
    return NextResponse.json({ 
      message: 'Appointment booked successfully',
      appointment: newAppointment 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}

