// app/admin/laundry-shops/new/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewLaundryShop() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    location: {
      address: '',
      coordinates: {
        type: 'Point',
        coordinates: [0, 0] // [longitude, latitude]
      }
    },
    menu: []
  });

  const [menuItem, setMenuItem] = useState({
    name: '',
    description: '',
    clothType: '',
    price: '',
    category: 'Washing'
  });

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
    const newCoordinates = [...formData.location.coordinates];
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

  const handleMenuItemChange = (e) => {
    const { name, value } = e.target;
    setMenuItem({
      ...menuItem,
      [name]: name === 'price' ? parseFloat(value) : value
    });
  };

  const addMenuItem = () => {
    if (!menuItem.name || !menuItem.price) {
      setError('Menu item name and price are required');
      return;
    }
    
    setFormData({
      ...formData,
      menu: [...formData.menu, { ...menuItem }]
    });
    
    // Reset the menu item form
    setMenuItem({
      name: '',
      description: '',
      clothType: '',
      price: '',
      category: 'Washing'
    });
    
    setError(null);
  };

  const removeMenuItem = (index) => {
    const updatedMenu = [...formData.menu];
    updatedMenu.splice(index, 1);
    setFormData({
      ...formData,
      menu: updatedMenu
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
      
      if (formData.menu.length === 0) {
        throw new Error('At least one menu item is required');
      }
      
      const response = await fetch('/api/admin/laundry-shops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create laundry shop');
      }
      
      router.push('/admin/laundry-shops');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Laundry Shop</h1>
        <Link 
          href="/admin/laundry-shops" 
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
        >
          Back to List
        </Link>
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
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Menu Items</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded">
            <div>
              <label className="block mb-1 font-medium">Service Name</label>
              <input
                type="text"
                name="name"
                value={menuItem.name}
                onChange={handleMenuItemChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Category</label>
              <select
                name="category"
                value={menuItem.category}
                onChange={handleMenuItemChange}
                className="w-full p-2 border border-gray-300 rounded"
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
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Price</label>
              <input
                type="number"
                name="price"
                value={menuItem.price}
                onChange={handleMenuItemChange}
                step="0.01"
                min="0"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                name="description"
                value={menuItem.description}
                onChange={handleMenuItemChange}
                className="w-full p-2 border border-gray-300 rounded"
                rows="2"
              ></textarea>
            </div>
            
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={addMenuItem}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
              >
                Add Menu Item
              </button>
            </div>
          </div>
          
          {formData.menu.length > 0 ? (
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
                  {formData.menu.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border">{item.name}</td>
                      <td className="py-2 px-4 border">{item.category}</td>
                      <td className="py-2 px-4 border">{item.clothType}</td>
                      <td className="py-2 px-4 border">${item.price.toFixed(2)}</td>
                      <td className="py-2 px-4 border">
                        <button
                          type="button"
                          onClick={() => removeMenuItem(index)}
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-xs"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-yellow-100 p-4 text-yellow-800 rounded">
              No menu items added yet. Please add at least one service to your menu.
            </div>
          )}
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded font-medium ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Laundry Shop'}
          </button>
        </div>
      </form>
    </div>
  );
}

