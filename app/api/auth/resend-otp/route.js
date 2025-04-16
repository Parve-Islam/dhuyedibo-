import { sendOTPEmail, generateOTP } from '../../../utils/email';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req) {
  try {
    const body = await req.json();
    await dbConnect();
    const { email } = body;

    const user = await User.findOne({ email });
    if (!user) {
      return new Response(JSON.stringify({ message: 'No registration in progress for this email' }), { status: 400 });
    }

    // Generate new OTP
    const newOTP = generateOTP();

    // Update OTP and expiry time in the user's record
    user.otp = newOTP;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // Set OTP expiry to 10 minutes

    await user.save();

    // Send new OTP
    await sendOTPEmail(email, newOTP);

    return new Response(JSON.stringify({ message: 'New OTP sent to your email' }), { status: 200 });
    
  } catch (error) {
    console.error('Resend OTP error:', error);
    return new Response(JSON.stringify({ message: 'Server error while resending OTP' }), { status: 500 });
  }
}
