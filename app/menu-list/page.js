'use client';
import { useEffect, useState } from 'react';

const MenuList = () => {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    // Fetching all uploaded menu items
    const fetchMenu = async () => {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (data.success) {
        setMenu(data.menu);
      } else {
        alert("Failed to fetch menu: " + data.message);
      }
    };
    fetchMenu();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Uploaded Laundry Menus</h2>
      {menu.length > 0 ? (
        <div className="space-y-4">
          {menu.map((item, index) => (
            <div key={index} className="border p-4 rounded shadow-md">
              <h3 className="text-xl font-semibold">{item.clothType} - {item.serviceType}</h3>
              <p><strong>Price:</strong> {item.price} TK</p>
              <p><strong>Shop ID:</strong> {item.shopId}</p>
              <p><strong>Service ID:</strong> {item.serviceId}</p>
              <p><strong>Uploaded at:</strong> {new Date(item.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No menus uploaded yet.</p>
      )}
    </div>
  );
};

export default MenuList;