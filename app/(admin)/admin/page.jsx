// File: app/admin/page.jsx
'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    }
  }, [status, session, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-purple-700 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard" 
              className="px-4 py-2 bg-white text-purple-700 rounded hover:bg-gray-100 transition-colors"
            >
              User Dashboard
            </Link>
            <button 
              onClick={() => signOut()} 
              className="px-4 py-2 bg-white text-purple-700 rounded hover:bg-gray-100 transition-colors"
            >
              Logout

            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-2xl font-semibold mb-6">Admin Controls</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-purple-700 mb-4">Admin Information</h3>
                <p><span className="font-semibold">Name:</span> {session?.user?.name}</p>
                <p><span className="font-semibold">Email:</span> {session?.user?.email}</p>
                <p><span className="font-semibold">Role:</span> {session?.user?.role}</p>
                <p><span className="font-semibold">ID:</span> {session?.user?.id}</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">System Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded shadow-sm">
                    <h4 className="text-sm text-gray-500">Total Users</h4>
                    <p className="text-2xl font-bold">--</p>
                  </div>
                  <div className="bg-white p-4 rounded shadow-sm">
                    <h4 className="text-sm text-gray-500">New Users (24h)</h4>
                    <p className="text-2xl font-bold">--</p>
                  </div>
                  <div className="bg-white p-4 rounded shadow-sm">
                    <h4 className="text-sm text-gray-500">Active Users</h4>
                    <p className="text-2xl font-bold">--</p>
                  </div>
                  <div className="bg-white p-4 rounded shadow-sm">
                    <h4 className="text-sm text-gray-500">Pending Verifications</h4>
                    <p className="text-2xl font-bold">--</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Admin Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link 
                  href="/admin/users" 
                  className="p-4 bg-white border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  Manage Users
                </Link>
                <Link 
                  href="/admin/laundry-shops" 
                  className="p-4 bg-white border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  Manage Laundry Shops
                </Link>
                <Link 
                  href="/admin/logs" 
                  className="p-4 bg-white border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  View Logs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}