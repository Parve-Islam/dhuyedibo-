import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

// Utility function to send reset password email
const sendResetPasswordEmail = async (email, resetToken) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use any email service (e.g., Gmail, SendGrid, etc.)
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your email password or an app password
    },
  });

  const resetPasswordUrl = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender's email
    to: email, // Recipient's email
    subject: 'Password Reset Request',
    text: `You requested a password reset. Click the link below to reset your password: \n\n${resetPasswordUrl}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Error sending password reset email');
  }
};

export async function POST(req) {
  try {
    const body = await req.json();
    await dbConnect();
    const { email } = body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 400 });
    }

    // Generate a reset token (using crypto for uniqueness and randomness)
    const resetToken = crypto.randomBytes(32).toString('hex');  // Generate a random 32-byte token

    // Set reset token and expiry time (1 hour validity)
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour expiry

    // Save user with reset token and expiry
    await user.save();

    // Send reset token to the user's email
    await sendResetPasswordEmail(email, resetToken);

    return new Response(JSON.stringify({ message: 'Password reset email sent' }), { status: 200 });
  } catch (error) {
    console.error('Error in forgot password API:', error);
    return new Response(JSON.stringify({ message: 'Server error during password reset request' }), { status: 500 });
  }
}
