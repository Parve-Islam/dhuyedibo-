// app/admin/laundry-shops/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LaundryShopDetails() {
  const params = useParams();
  const router = useRouter();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchShopDetails() {
      try {
        const response = await fetch(`/api/admin/laundry-shops/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch shop details');
        }
        const data = await response.json();
        setShop(data.laundryShop);
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

  const handleStatusToggle = async () => {
    const newStatus = !shop.isActive;
    const confirmMessage = newStatus 
      ? 'Are you sure you want to activate this shop?' 
      : 'Are you sure you want to deactivate this shop?';
    
    if (window.confirm(confirmMessage)) {
      try {
        const response = await fetch(`/api/admin/laundry-shops/${params.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isActive: newStatus }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to ${newStatus ? 'activate' : 'deactivate'} shop`);
        }
        
        setShop({
          ...shop,
          isActive: newStatus
        });
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-8">Error: {error}</div>;
  if (!shop) return <div className="p-8">Shop not found</div>;

  const averageRating = shop.ratings?.length 
    ? (shop.ratings.reduce((sum, rating) => sum + rating, 0) / shop.ratings.length).toFixed(1) 
    : 'No ratings';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{shop.name}</h1>
        <div className="flex space-x-2">
          <Link 
            href="/admin/laundry-shops" 
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
          >
            Back to List
          </Link>
          <Link 
            href={`/admin/laundry-shops/${params.id}/edit`} 
            className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded"
          >
            Edit Shop
          </Link>
          <button
            onClick={handleStatusToggle}
            className={`${
              shop.isActive 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            } text-white py-2 px-4 rounded`}
          >
            {shop.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Shop Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{shop.location.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span 
                className={`px-2 py-1 rounded text-xs ${
                  shop.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {shop.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">
                Lon: {shop.location.coordinates.coordinates[0].toFixed(6)}, 
                Lat: {shop.location.coordinates.coordinates[1].toFixed(6)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="font-medium">{averageRating}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium">{new Date(shop.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-medium">{new Date(shop.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Services Menu</h2>
            <Link 
              href={`/admin/laundry-shops/${params.id}/menu/add`}
              className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm"
            >
              Add Service
            </Link>
          </div>
          
          {shop.menu.length === 0 ? (
            <p className="text-gray-500">No services available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border text-left">Name</th>
                    <th className="py-2 px-4 border text-left">Category</th>
                    <th className="py-2 px-4 border text-left">Cloth Type</th>
                    <th className="py-2 px-4 border text-left">Price</th>
                    <th className="py-2 px-4 border text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shop.menu.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border">
                        {item.name}
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                        )}
                      </td>
                      <td className="py-2 px-4 border">{item.category}</td>
                      <td className="py-2 px-4 border">{item.clothType || '-'}</td>
                      <td className="py-2 px-4 border">${item.price.toFixed(2)}</td>
                      <td className="py-2 px-4 border">
                        <div className="flex space-x-2">
                          <Link 
                            href={`/admin/laundry-shops/${params.id}/menu/${item._id}/edit`}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded text-xs"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this service?')) {
                                try {
                                  const response = await fetch(
                                    `/api/admin/laundry-shops/${params.id}/menu/${item._id}`,
                                    { method: 'DELETE' }
                                  );
                                  
                                  if (!response.ok) {
                                    throw new Error('Failed to delete menu item');
                                  }
                                  
                                  const data = await response.json();
                                  setShop({
                                    ...shop,
                                    menu: data.menu
                                  });
                                } catch (err) {
                                  setError(err.message);
                                }
                              }
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-xs"
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
    </div>
  );
}
