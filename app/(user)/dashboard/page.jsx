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
  const [todayReminders, setTodayReminders] = useState([]);
  const [reminderLoading, setReminderLoading] = useState(true);
  const [reminderError, setReminderError] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      setLoading(false);
      fetchTodayReminders();
    }
  }, [status, router]);

  const fetchTodayReminders = async () => {
    if (!session?.user?.id) return;

    setReminderLoading(true);
    try {
      // Get today's start and end date in ISO format
      const today = new Date();
      const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      
      const response = await fetch(
        `/api/reminders?userId=${session.user.id}&startDate=${startDate}&endDate=${endDate}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch today\'s reminders');
      }
      
      const data = await response.json();
      setTodayReminders(data.reminders);
    } catch (err) {
      setReminderError(err.message);
    } finally {
      setReminderLoading(false);
    }
  };

  const handleToggleComplete = async (id, isCompleted) => {
    try {
      const response = await fetch(`/api/reminders/${id}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCompleted }),
      });

      if (!response.ok) {
        throw new Error('Failed to update reminder status');
      }

      // Update local state
      setTodayReminders(todayReminders.map(reminder => 
        reminder._id === id ? { ...reminder, isCompleted } : reminder
      ));
    } catch (err) {
      console.error('Error updating reminder:', err);
    }
  };

  const getReminderStatusClass = (reminder) => {
    const now = new Date();
    const reminderDate = new Date(reminder.date);
    
    if (reminder.isCompleted) {
      return "bg-gray-100 border-gray-300"; // Completed reminders
    } else if (reminderDate < now) {
      return "bg-red-100 border-red-300"; // Passed and not completed
    } else {
      return "bg-green-100 border-green-300"; // Upcoming
    }
  };

  const formatTime = (dateString) => {
    const options = { 
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

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
          {/* Today's Reminders Section */}
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6 bg-white mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Today's Reminders</h2>
              <Link 
                href="/reminder" 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                View All Reminders
              </Link>
            </div>
            
            {reminderLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin inline-block h-6 w-6 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
                <p className="mt-2 text-gray-500">Loading reminders...</p>
              </div>
            ) : reminderError ? (
              <div className="bg-red-50 p-4 rounded-md text-red-800">
                Error: {reminderError}
              </div>
            ) : todayReminders.length > 0 ? (
              <div className="space-y-3">
                {todayReminders.map((reminder) => (
                  <div 
                    key={reminder._id}
                    className={`border rounded-lg p-4 flex items-center justify-between ${getReminderStatusClass(reminder)}`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={reminder.isCompleted}
                        onChange={() => handleToggleComplete(reminder._id, !reminder.isCompleted)}
                        className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <h3 className={`font-medium ${reminder.isCompleted ? 'line-through text-gray-500' : ''}`}>
                          {reminder.title}
                        </h3>
                        <p className="text-sm text-gray-600">{formatTime(reminder.date)}</p>
                      </div>
                    </div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-white">
                      {reminder.priority}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No reminders for today!</p>
                <Link 
                  href="/reminder?action=create" 
                  className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  Create a Reminder
                </Link>
              </div>
            )}
          </div>

          {/* User Information Section */}
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
                  href="/reminder" 
                  className="p-4 bg-white border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  Reminder
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