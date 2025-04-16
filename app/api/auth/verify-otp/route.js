import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req) {
  try {
    const body = await req.json();
    await dbConnect();
    const { otp } = body;

    if (!otp) {
      return new Response(JSON.stringify({ message: 'OTP is required' }), { status: 400 });
    }

    // Find the user by OTP
    const user = await User.findOne({ 
      otp,
      otpExpiry: { $gt: Date.now() } // Only find if OTP hasn't expired
    });

    if (!user) {
      return new Response(JSON.stringify({ message: 'Invalid or expired OTP' }), { status: 400 });
    }

    // OTP is valid, update user as verified
    user.isVerified = true;

    // Clear OTP and OTP expiry after successful verification
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    return new Response(
      JSON.stringify({
        message: 'Account successfully verified',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      }),
      { status: 201 }
    );
    
  } catch (error) {
    console.error('OTP verification error:', error);
    return new Response(JSON.stringify({ message: 'Server error during OTP verification' }), { status: 500 });
  }
}