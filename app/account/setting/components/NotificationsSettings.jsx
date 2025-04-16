// app/account/settings/components/NotificationsSettings.js
'use client'

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function NotificationsSettings({ notifications, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update notification');
      }

      toast.success('Notification marked as read');
      onUpdate(); // Refresh user data
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/clear-all', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clear notifications');
      }

      toast.success('All notifications cleared');
      onUpdate(); // Refresh user data
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Notifications</h2>
        {notifications.length > 0 && (
          <button
            onClick={handleClearAll}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Mark all as read
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          You don't have any notifications
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification._id} 
              className={`p-4 border rounded-md ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}
            >
              <div className="flex justify-between">
                <h3 className="font-medium">{notification.title}</h3>
                <span className="text-xs text-gray-500">{formatDate(notification.createdAt)}</span>
              </div>
              <p className="mt-1 text-gray-600">{notification.message}</p>
              {!notification.read && (
                <button
                  onClick={() => handleMarkAsRead(notification._id)}
                  disabled={loading}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}