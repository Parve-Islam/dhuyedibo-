// app/account/settings/page.js
'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProfileForm from './components/ProfileForm';
import PasswordForm from './components/PasswordForm';
import NotificationsSettings from './components/NotificationsSettings';
import AccountNav from './components/AccountNav';

export default function AccountSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/account');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      setUserData(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <AccountNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow p-6">
            {activeTab === 'profile' && (
              <ProfileForm 
                userData={userData} 
                onUpdate={fetchUserData} 
              />
            )}
            
            {activeTab === 'password' && (
              <PasswordForm onUpdate={fetchUserData} />
            )}
            
            {activeTab === 'notifications' && (
              <NotificationsSettings 
                notifications={userData?.notifications || []} 
                onUpdate={fetchUserData} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}