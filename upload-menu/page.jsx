// components/UploadMenu.js
"use client";
import { useState } from 'react';

export default function UploadMenu() {
  const [clothTypes, setClothTypes] = useState(['Shirt', 'Pant', 'Half-pant', 'Jacket', 'Panjabi', 'Saari']);
  const [serviceTypes, setServiceTypes] = useState(['Washing', 'Ironing', 'Dry Cleaning']);
  const [form, setForm] = useState({
    clothType: '',
    serviceType: '',
    price: '',
    shopId: '',
    serviceId: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleAddClothType = () => {
    const newType = prompt("Enter new cloth type:");
    if (newType && !clothTypes.includes(newType)) {
      setClothTypes(prev => [...prev, newType]);
    }
  };
  
  const handleAddServiceType = () => {
    const newService = prompt("Enter new service type:");
    if (newService && !serviceTypes.includes(newService)) {
      setServiceTypes(prev => [...prev, newService]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseInt(form.price),
          shopId: parseInt(form.shopId),
          serviceId: parseInt(form.serviceId),
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        setForm({
          clothType: '',
          serviceType: '',
          price: '',
          shopId: '',
          serviceId: '',
        });
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch (error) {
      alert("Server Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      minHeight: '100vh', 
      padding: '2rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: '#0ea5e9', // Sky blue color
          padding: '1.5rem',
          color: 'white'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            margin: 0 
          }}>Upload Laundry Menu</h2>
          <p style={{ 
            marginTop: '0.25rem', 
            color: '#e0f2fe' // Light sky blue for subtitle
          }}>Add new items to your laundry service menu</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {success && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              padding: '0.75rem 1rem',
              borderRadius: '0.375rem',
              marginBottom: '1.5rem'
            }}>
              Menu item added successfully!
            </div>
          )}
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#0369a1', // Sky blue for labels
              marginBottom: '0.5rem'
            }}>
              Cloth Type
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select 
                name="clothType" 
                value={form.clothType}
                onChange={handleChange} 
                style={{
                  flex: '1',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
                required
              >
                <option value="">Select</option>
                {clothTypes.map((type, i) => (
                  <option key={i} value={type}>{type}</option>
                ))}
              </select>
              <button 
                type="button" 
                onClick={handleAddClothType}
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                + Add
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#0369a1', // Sky blue for labels
              marginBottom: '0.5rem'
            }}>
              Service Type
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select 
                name="serviceType" 
                value={form.serviceType}
                onChange={handleChange} 
                style={{
                  flex: '1',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
                required
              >
                <option value="">Select</option>
                {serviceTypes.map((type, i) => (
                  <option key={i} value={type}>{type}</option>
                ))}
              </select>
              <button 
                type="button" 
                onClick={handleAddServiceType}
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                + Add
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#0369a1', // Sky blue for labels
              marginBottom: '0.5rem'
            }}>
              Price (tk)
            </label>
            <input 
              name="price" 
              type="number" 
              value={form.price}
              onChange={handleChange} 
              placeholder="Enter price" 
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                outline: 'none'
              }}
              required 
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#0369a1', // Sky blue for labels
              marginBottom: '0.5rem'
            }}>
              Shop ID
            </label>
            <input 
              name="shopId" 
              type="number" 
              value={form.shopId}
              onChange={handleChange} 
              placeholder="Enter shop ID" 
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                outline: 'none'
              }}
              required 
            />
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#0369a1', // Sky blue for labels
              marginBottom: '0.5rem'
            }}>
              Service ID
            </label>
            <input 
              name="serviceId" 
              type="number" 
              value={form.serviceId}
              onChange={handleChange} 
              placeholder="Enter service ID" 
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                outline: 'none'
              }}
              required 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: loading ? '#7dd3fc' : '#0ea5e9', // Sky blue for button
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing...' : 'Upload Menu'}
          </button>
        </form>
      </div>
    </div>
  );
}