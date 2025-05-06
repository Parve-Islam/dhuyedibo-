// app/page.js - Main page component
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReminderList from '@/components/ReminderList';
import ReminderForm from '@/components/ReminderForm';
import DateRangeFilter from '@/components/DateRangeFilter';
import { useSession } from 'next-auth/react';

export default function Home() {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  // For demo purposes - in a real app, you'd get this from auth
  const session = useSession();
  const userId = session.data?.user?.id;
  console.log('Session data:', session?.data);

  const fetchReminders = async () => {
    setIsLoading(true);
    try {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      else{
        console.log('Fetching reminders with userId:', userId);
      let url = `/api/reminders?userId=${userId}`;
      
      if (dateFilter.startDate) {
        url += `&startDate=${dateFilter.startDate}`;
      }
      
      if (dateFilter.endDate) {
        url += `&endDate=${dateFilter.endDate}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reminders');
      }
      
      const data = await response.json();
      setReminders(data.reminders);
      setError(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [dateFilter, session]);

  const handleReminderCreate = async (reminderData) => {
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...reminderData,
          user: userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create reminder');
      }

      // Refresh the list
      fetchReminders();
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReminderComplete = async (id, isCompleted) => {
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
      setReminders(reminders.map(reminder => 
        reminder._id === id ? { ...reminder, isCompleted } : reminder
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReminderDelete = async (id) => {
    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete reminder');
      }

      // Remove from local state
      setReminders(reminders.filter(reminder => reminder._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">My Reminders</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {showForm ? 'Cancel' : 'Add New Reminder'}
        </button>
        
        <DateRangeFilter 
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />
      </div>

      {showForm && (
        <div className="mb-6">
          <ReminderForm onSubmit={handleReminderCreate} />
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4">Loading reminders...</div>
      ) : reminders.length > 0 ? (
        <ReminderList 
          reminders={reminders} 
          onComplete={handleReminderComplete}
          onDelete={handleReminderDelete}
        />
      ) : (
        <div className="text-center py-4 bg-gray-100 rounded">
          No reminders found. Create one to get started!
        </div>
      )}
    </div>
  );
}

