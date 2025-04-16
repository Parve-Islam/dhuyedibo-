// app/api/menu/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import LaundryMenu from '@/models/LaundryMenu';

export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    const menu = new LaundryMenu(body);
    const saved = await menu.save();
    return NextResponse.json({ success: true, menu: saved });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}