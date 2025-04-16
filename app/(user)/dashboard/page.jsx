// File: app/dashboard/page.jsx
'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      setLoading(false);
    }
  }, [status, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            {session?.user?.role === 'admin' && (
              <Link 
                href="/admin" 
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                Admin Panel
              </Link>
            )}
            
            <button onClick={() => signOut()} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                Sign Out
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-2xl font-semibold mb-6">User Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  {session?.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name} 
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl text-indigo-700">{session?.user?.name?.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium">{session?.user?.name}</h3>
                  <p className="text-gray-500">{session?.user?.email}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Account Details</h3>
                <p><span className="font-semibold">Role:</span> {session?.user?.role}</p>
                <p><span className="font-semibold">User ID:</span> {session?.user?.id}</p>
              </div>
            </div>
            
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link 
                  href="/profile/edit" 
                  className="p-4 bg-white border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  Edit Profile
                </Link>
                <Link 
                  href="/appointments" 
                  className="p-4 bg-white border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  Appointments
                </Link>
                <Link 
                  href="/settings" 
                  className="p-4 bg-white border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  Account Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}