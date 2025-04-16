
// app/admin/laundry-shops/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LaundryShopList() {
  const [laundryShops, setLaundryShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchLaundryShops() {
      try {
        const response = await fetch('/api/admin/laundry-shops');
        if (!response.ok) {
          throw new Error('Failed to fetch laundry shops');
        }
        const data = await response.json();
        setLaundryShops(data.laundryShops);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLaundryShops();
  }, []);

  const handleDeactivate = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this laundry shop?')) {
      try {
        const response = await fetch(`/api/admin/laundry-shops/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to deactivate laundry shop');
        }
        
        // Update the list by marking the shop as inactive
        setLaundryShops(prevShops => 
          prevShops.map(shop => 
            shop._id === id ? { ...shop, isActive: false } : shop
          )
        );
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleActivate = async (id) => {
    try {
      const response = await fetch(`/api/admin/laundry-shops/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: true }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to activate laundry shop');
      }
      
      // Update the list by marking the shop as active
      setLaundryShops(prevShops => 
        prevShops.map(shop => 
          shop._id === id ? { ...shop, isActive: true } : shop
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-8">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Laundry Shops</h1>
        <Link 
          href="/admin/laundry-shops/new" 
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Add New Shop
        </Link>
      </div>

      {laundryShops.length === 0 ? (
        <p>No laundry shops found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border text-left">Name</th>
                <th className="py-2 px-4 border text-left">Address</th>
                <th className="py-2 px-4 border text-left">Menu Items</th>
                <th className="py-2 px-4 border text-left">Status</th>
                <th className="py-2 px-4 border text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {laundryShops.map((shop) => (
                <tr key={shop._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border">{shop.name}</td>
                  <td className="py-2 px-4 border">{shop.location.address}</td>
                  <td className="py-2 px-4 border">{shop.menu.length}</td>
                  <td className="py-2 px-4 border">
                    <span 
                      className={`px-2 py-1 rounded text-xs ${
                        shop.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {shop.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-2 px-4 border">
                    <div className="flex space-x-2">
                      <Link 
                        href={`/admin/laundry-shops/${shop._id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs"
                      >
                        View
                      </Link>
                      <Link 
                        href={`/admin/laundry-shops/${shop._id}/edit`}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded text-xs"
                      >
                        Edit
                      </Link>
                      {shop.isActive ? (
                        <button
                          onClick={() => handleDeactivate(shop._id)}
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-xs"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(shop._id)}
                          className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded text-xs"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}