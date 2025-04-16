
// app/admin/laundry-shops/[id]/menu/add/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddMenuItem() {
  const params = useParams();
  const router = useRouter();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [menuItem, setMenuItem] = useState({
    name: '',
    description: '',
    clothType: '',
    price: '',
    category: 'Washing'
  });

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

  const handleMenuItemChange = (e) => {
    const { name, value } = e.target;
    setMenuItem({
      ...menuItem,
      [name]: name === 'price' ? parseFloat(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!menuItem.name || !menuItem.price) {
        throw new Error('Service name and price are required');
      }
      
      const response = await fetch(`/api/admin/laundry-shops/${params.id}/menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menuItem),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add menu item');
      }
      
      router.push(`/admin/laundry-shops/${params.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (!shop) return <div className="p-8">Shop not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add Service to {shop.name}</h1>
        <Link 
          href={`/admin/laundry-shops/${params.id}`} 
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
        >
          Cancel
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Service Name</label>
            <input
              type="text"
              name="name"
              value={menuItem.name}
              onChange={handleMenuItemChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Category</label>
            <select
              name="category"
              value={menuItem.category}
              onChange={handleMenuItemChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="Washing">Washing</option>
              <option value="Ironing">Ironing</option>
              <option value="Dry Cleaning">Dry Cleaning</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Cloth Type</label>
            <input
              type="text"
              name="clothType"
              value={menuItem.clothType}
              onChange={handleMenuItemChange}
              placeholder="e.g. Cotton, Wool, Denim"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Price ($)</label>
            <input
              type="number"
              name="price"
              value={menuItem.price}
              onChange={handleMenuItemChange}
              step="0.01"
              min="0"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={menuItem.description}
              onChange={handleMenuItemChange}
              placeholder="Describe the service details..."
              className="w-full p-2 border border-gray-300 rounded"
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded font-medium ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Adding...' : 'Add Service'}
          </button>
        </div>
      </form>
    </div>
  );
}