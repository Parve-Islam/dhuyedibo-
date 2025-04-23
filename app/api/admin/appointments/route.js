import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Appointment from '@/models/Appointment';
import '@/models/LaundryShop'; // Import the LaundryShop model to ensure it's registered

export async function GET() {
  try {
    await dbConnect();
    const appointments = await Appointment.find({})
      .populate('userId', 'name email')
      .populate('laundryShopId', 'name location')
      .sort({ date: -1 });
    
    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await dbConnect();
    
    const newAppointment = new Appointment(body);
    const savedAppointment = await newAppointment.save();
    
    return NextResponse.json({ appointment: savedAppointment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}