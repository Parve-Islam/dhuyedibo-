// app/api/appointments/[id]/route.js
import { NextResponse } from 'next/server';
import Appointment from '@/models/Appointment';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const appointment = await Appointment.findById(id)
      .populate('laundryShopId', 'name location menu');
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    // Check if the appointment belongs to the user
    if (appointment.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('Error fetching appointment details:', error);
    return NextResponse.json({ error: 'Failed to fetch appointment details' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { status } = await request.json();
    
    if (!status || !['Scheduled', 'Completed', 'Cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    
    await dbConnect();
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    // Check if the appointment belongs to the user
    if (appointment.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    appointment.status = status;
    await appointment.save();
    
    return NextResponse.json({ 
      message: 'Appointment updated successfully',
      appointment 
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}