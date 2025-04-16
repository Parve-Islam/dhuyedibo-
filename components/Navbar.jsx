'use client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React from 'react';

const Navbar = () => {
    const session = useSession();
    const data = session.data;
    const userLoggedIn = data && data.user;
   
    return (
        <header className="bg-white shadow-md">
      <nav className="container mx-auto p-4">
          <ul className="flex justify-center space-x-6 text-lg">
            <li><Link href="/" className="text-gray-800 hover:text-green-600">Home</Link></li>
            <li><Link href="/laundry-shops" className="text-gray-800 hover:text-green-600">Laundry Discovery</Link></li>
            <li>
              <Link href={userLoggedIn ? '/profile' : '/register'} className="text-gray-800 hover:text-green-600">
                {userLoggedIn ? 'Profile' : 'Sign Up'}
              </Link>
             
            </li>
            <li>
              <Link href={userLoggedIn ? '/dashboard' : '/login'} className="text-gray-800 hover:text-green-600">
                {userLoggedIn ? 'Dashboard' : 'Log In'}
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    );
};

export default Navbar;