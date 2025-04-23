// app/api/appointments/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Appointment from '@/models/Appointment';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const appointment = await Appointment.findById(params.id)
      .populate('userId', 'name email')
      .populate('laundryShopId', 'name location');
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    return NextResponse.json({ appointment }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    await dbConnect();
    
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!updatedAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    return NextResponse.json({ appointment: updatedAppointment }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const deletedAppointment = await Appointment.findByIdAndDelete(params.id);
    
    if (!deletedAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Appointment deleted successfully' }, { status: 200 });
  }
  catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}