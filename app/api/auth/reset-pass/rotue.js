import dbConnect from '@/lib/dbConnect';
import bcrypt from 'bcrypt';
import User from '@/models/User';

export async function POST(req) {
  console.log('Reset password API called');
  try {
    const body = await req.json();
    await dbConnect();
    const { resetToken, newPassword } = body;

    
    // Validate inputs
    if (!resetToken || !newPassword) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Missing required fields' 
        }), 
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      console.error('Password must be at least 8 characters long');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Password must be at least 8 characters long' 
        }), 
        { status: 400 }
      );
    }

    // Find the user by reset token
    const user = await User.findOne({ 
      resetToken,
      resetTokenExpiry: { $gt: Date.now() } // Check expiry in the query
    });
console.log(user)
    if (!user) {
      console.error('Invalid or expired reset token');

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid or expired reset token' 
        }), 
        { status: 400 }
      );
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password and clear the reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.updatedAt = new Date(); // Track when the password was changed

    await user.save();

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset successful' 
      }), 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in reset password API:', error.message);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Server error during password reset' 
      }), 
      { status: 500 }
    );
  }
}