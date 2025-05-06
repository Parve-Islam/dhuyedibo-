// app/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const HomePage = () => {
  const session = useSession();
    const data = session.data;
    const userLoggedIn = data && data.user;
  const router = useRouter();
  // const [userLoggedIn, setUserLoggedIn] = useState(false); // Placeholder for user login state
  const [laundryShops, setLaundryShops] = useState([
    { name: 'Super Clean Laundry', rating: 4.5, distance: '2 km', services: ['Washing', 'Ironing', 'Dry Cleaning'] },
    { name: 'Fresh & Clean Laundry', rating: 4.8, distance: '5 km', services: ['Washing', 'Ironing', 'Dry Cleaning', 'Pickup & Delivery'] },
    { name: 'Quick Wash Laundry', rating: 4.2, distance: '3.5 km', services: ['Washing', 'Ironing'] },
  ]);

  useEffect(() => {
    // Assuming user is logged in if there is a 'user' item in localStorage (simulating login status)
    const user = localStorage.getItem('user');
    if (user) {
      setUserLoggedIn(true);
    }
  }, []);

  return (
    <div className="font-sans bg-gray-50 min-h-screen flex flex-col">
      {/* Navigation */}
      

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center bg-green-600 text-white text-center p-16 space-y-6">
        <h1 className="text-4xl font-semibold">Welcome to Laundry Shop Discovery</h1>
        <p className="text-xl">Find the best laundry services near you, book appointments, and more.</p>
        <div>
          <button 
            className="bg-white text-green-600 py-2 px-6 rounded-lg shadow-md hover:bg-green-100"
            onClick={() => router.push('/laundry-discovery')}
          >
            Discover Laundry Shops
          </button>
          {!userLoggedIn && (
            <button 
              className="ml-4 bg-white text-green-600 py-2 px-6 rounded-lg shadow-md hover:bg-green-100"
              onClick={() => router.push('/register')}
            >
              Sign Up
            </button>
          )}
        </div>
      </section>

      {/* Laundry Discovery Section */}
      <section className="container mx-auto py-12 px-6">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Nearby Laundry Shops</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {laundryShops.map((shop, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-gray-800">{shop.name}</h3>
              <p className="text-gray-600">Rating: {shop.rating} | Distance: {shop.distance}</p>
              <p className="text-gray-600 mt-2">Services: {shop.services.join(', ')}</p>
              <button 
                className="mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-500"
                onClick={() => router.push(`/laundry/${index}`)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Our Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-gray-800">Washing</h3>
              <p className="text-gray-600">Get your clothes washed with care at affordable prices.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-gray-800">Ironing</h3>
              <p className="text-gray-600">Professional ironing for your garments, making them wrinkle-free.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-gray-800">Dry Cleaning</h3>
              <p className="text-gray-600">Delicate dry cleaning services for your favorite clothes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-6">
        <p>&copy; 2025 Laundry Shop Discovery. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
