import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

// Utility function to generate a random OTP
const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
  return otp.toString();
};

// Utility function to send OTP email
const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Account Verification OTP',
    text: `Your OTP for account verification is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Error sending OTP email');
  }
};

export async function POST(req) {
  try {
    const body = await req.json();
    await dbConnect();
    const { name, email, password} = body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return new Response(JSON.stringify({ message: 'Email already exists' }), { status: 400 });
      } else {
        // If the user exists but is not verified
        const otp = generateOTP();
        existingUser.otp = otp;
        existingUser.otpExpiry = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
        const salt = await bcrypt.genSalt(10);
        existingUser.password = await bcrypt.hash(password, salt);
      
        
        await existingUser.save();
        await sendOTPEmail(email, otp);
        return new Response(JSON.stringify({ message: 'User not verified' }), { status: 401 });
      }
    }

    // Generate OTP
    const otp = generateOTP();
    

    // Create user and store OTP in the user document
    const newUser = new User({
      name,
      email,
      password,
      role: 'user',
      otp,
      otpExpiry: Date.now() + 10 * 60 * 1000,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    // Save user (with OTP and expiry)
    await newUser.save();

    // Send OTP via email
    await sendOTPEmail(email, otp);

    return new Response(JSON.stringify({ message: 'OTP sent to your email for verification', email }), { status: 200 });

  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ message: 'Server error during registration', error: error.message }), { status: 500 });
  }
}