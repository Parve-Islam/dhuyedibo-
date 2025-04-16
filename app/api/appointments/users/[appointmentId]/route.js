// File: /api/appointments/users/[appointmentId]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import Appointment from '@/models/Appointment';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get a specific appointment
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { appointmentId } = params;
    
    await dbConnect();
    
    // Find the appointment and verify it belongs to the authenticated user
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      userId: session.user.id
    }).populate('laundryShopId');
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found or unauthorized' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ appointment });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Update an appointment
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { appointmentId } = params;
    const body = await request.json();
    
    await dbConnect();
    
    // Find the appointment and verify it belongs to the authenticated user
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      userId: session.user.id
    });
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found or unauthorized' },
        { status: 404 }
      );
    }
    
    // Prevent updating if appointment is already completed
    if (appointment.status === 'Completed') {
      return NextResponse.json(
        { error: 'Cannot update a completed appointment' },
        { status: 400 }
      );
    }
    
    // Only allow updating certain fields
    if (body.date) {
      appointment.date = new Date(body.date);
    }
    
    if (body.timeSlot) {
      appointment.timeSlot = body.timeSlot;
    }
    
    if (body.status && ['Scheduled', 'Cancelled'].includes(body.status)) {
      appointment.status = body.status;
    }
    
    await appointment.save();
    
    return NextResponse.json({ 
      success: true, 
      appointment 
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Delete an appointment
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { appointmentId } = params;
    
    await dbConnect();
    
    // Find the appointment and verify it belongs to the authenticated user
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      userId: session.user.id
    });
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found or unauthorized' },
        { status: 404 }
      );
    }
    
    // Prevent deleting if appointment is already completed
    if (appointment.status === 'Completed') {
      return NextResponse.json(
        { error: 'Cannot delete a completed appointment' },
        { status: 400 }
      );
    }
    
    // Delete the appointment
    await Appointment.deleteOne({ _id: appointmentId });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Appointment deleted successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}