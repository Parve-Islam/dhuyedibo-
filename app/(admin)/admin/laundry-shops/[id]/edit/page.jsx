
// app/admin/laundry-shops/[id]/edit/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditLaundryShop() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    location: {
      address: '',
      coordinates: {
        type: 'Point',
        coordinates: [0, 0]
      }
    },
    isActive: true
  });

  useEffect(() => {
    async function fetchShopDetails() {
      try {
        const response = await fetch(`/api/admin/laundry-shops/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch shop details');
        }
        const data = await response.json();
        setFormData(data.laundryShop);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchShopDetails();
    }
  }, [params.id]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    const index = name === 'longitude' ? 0 : 1;
    const newCoordinates = [...formData.location.coordinates.coordinates];
    newCoordinates[index] = parseFloat(value);
    
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        coordinates: {
          ...formData.location.coordinates,
          coordinates: newCoordinates
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!formData.name || !formData.location.address) {
        throw new Error('Shop name and address are required');
      }
      
      const response = await fetch(`/api/admin/laundry-shops/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          isActive: formData.isActive
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update laundry shop');
      }
      
      router.push(`/admin/laundry-shops/${params.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Laundry Shop</h1>
        <div className="flex space-x-2">
          <Link 
            href={`/admin/laundry-shops/${params.id}`} 
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
          >
            Cancel
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Shop Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Shop Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Address</label>
              <input
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Longitude</label>
              <input
                type="number"
                name="longitude"
                value={formData.location.coordinates.coordinates[0]}
                onChange={handleCoordinateChange}
                step="0.000001"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Latitude</label>
              <input
                type="number"
                name="latitude"
                value={formData.location.coordinates.coordinates[1]}
                onChange={handleCoordinateChange}
                step="0.000001"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Status</label>
              <select
                name="isActive"
                value={formData.isActive}
                onChange={(e) => setFormData({
                  ...formData,
                  isActive: e.target.value === 'true'
                })}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded font-medium ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Updating...' : 'Update Laundry Shop'}
          </button>
        </div>
      </form>
    </div>
  );
}
