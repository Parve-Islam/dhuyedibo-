'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Store, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function AppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/appointments');
      return;
    }
    
    if (status === 'authenticated') {
      fetchAppointments();
    }
  }, [status, router]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/appointments/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const data = await response.json();
      setAppointments(data.appointments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/appointments/users/${appointmentId}`, {
        method: 'PUT', // Changed from PATCH to PUT to match your API
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'Cancelled' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }
      
      // Update local state
      setAppointments(appointments.map(appt => 
        appt._id === appointmentId 
          ? { ...appt, status: 'Cancelled' } 
          : appt
      ));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Scheduled':
        return <Clock size={16} className="mr-1" />;
      case 'Completed':
        return <CheckCircle size={16} className="mr-1" />;
      case 'Cancelled':
        return <XCircle size={16} className="mr-1" />;
      default:
        return <AlertCircle size={16} className="mr-1" />;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Appointments</h1>
      
      {appointments.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600 mb-4">You don't have any appointments yet.</p>
          <Link 
            href="/laundry-shops" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Store size={16} className="mr-2" />
            Browse Laundry Shops
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div 
              key={appointment._id} 
              className="bg-white shadow rounded-lg overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">
                      {appointment.laundryShopId.name}
                    </h3>
                    <p className="text-gray-600 text-sm flex items-center mt-1">
                      <Store size={16} className="mr-1" />
                      {appointment.laundryShopId.location.address}
                    </p>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(appointment.status)}`}>
                    {getStatusIcon(appointment.status)}
                    {appointment.status}
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date</p>
                    <p className="flex items-center text-gray-800">
                      <Calendar size={16} className="mr-2 text-blue-600" />
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Time</p>
                    <p className="flex items-center text-gray-800">
                      <Clock size={16} className="mr-2 text-blue-600" />
                      {appointment.timeSlot}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                  <p className="text-xs text-gray-500">
                    Booked on {new Date(appointment.createdAt).toLocaleDateString()}
                  </p>
                  
                  {appointment.status === 'Scheduled' && (
                    <button 
                      onClick={() => cancelAppointment(appointment._id)}
                      className="text-red-600 text-sm hover:text-red-800"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}