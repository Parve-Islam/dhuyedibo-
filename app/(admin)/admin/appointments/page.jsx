// app/appointments/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    userId: '',
    laundryShopId: '',
    date: '',
    timeSlot: '',
    status: 'Scheduled'
  });
  const [editingId, setEditingId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/appointments');
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch appointments');
      
      setAppointments(data.appointments);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `/api/admin/appointments/${editingId}` 
        : '/api/admin/appointments';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to save appointment');
      
      // Reset form and refresh appointments
      setFormData({
        userId: '',
        laundryShopId: '',
        date: '',
        timeSlot: '',
        status: 'Scheduled'
      });
      setEditingId(null);
      fetchAppointments();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (appointment) => {
    setFormData({
      userId: appointment.userId._id,
      laundryShopId: appointment.laundryShopId._id,
      date: new Date(appointment.date).toISOString().split('T')[0],
      timeSlot: appointment.timeSlot,
      status: appointment.status
    });
    setEditingId(appointment._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete appointment');
      }
      
      fetchAppointments();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Appointment Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Appointment' : 'Create New Appointment'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">User</label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="User ID"
                className="w-full border rounded p-2"
                required
              />
            </div>
            
            <div>
              <label className="block mb-1">Laundry Shop</label>
              <input
                type="text"
                name="laundryShopId"
                value={formData.laundryShopId}
                onChange={handleChange}
                placeholder="Laundry Shop ID"
                className="w-full border rounded p-2"
                required
              />
            </div>
            
            <div>
              <label className="block mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            
            <div>
              <label className="block mb-1">Time Slot</label>
              <input
                type="text"
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleChange}
                placeholder="e.g. 10:00 AM - 12:00 PM"
                className="w-full border rounded p-2"
                required
              />
            </div>
            
            <div>
              <label className="block mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {editingId ? 'Update' : 'Create'} Appointment
            </button>
            
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    userId: '',
                    laundryShopId: '',
                    date: '',
                    timeSlot: '',
                    status: 'Scheduled'
                  });
                  setEditingId(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">All Appointments</h2>
        
        {isLoading ? (
          <p>Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Customer</th>
                  <th className="py-2 px-4 text-left">Laundry Shop</th>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Time Slot</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appointment => (
                  <tr key={appointment._id} className="border-t">
                    <td className="py-2 px-4">{appointment.userId?.name || 'Unknown'}</td>
                    <td className="py-2 px-4">{appointment.laundryShopId?.name || 'Unknown'}</td>
                    <td className="py-2 px-4">{formatDate(appointment.date)}</td>
                    <td className="py-2 px-4">{appointment.timeSlot}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        appointment.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                        appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(appointment)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(appointment._id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}