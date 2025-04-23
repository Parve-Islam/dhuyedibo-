'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState({ isOpen: false, orderId: null });
  const [review, setReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchOrders();
  }, [session]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/user');
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: reviewModal.orderId,
          ...review
        }),
      });

      if (response.ok) {
        setReviewModal({ isOpen: false, orderId: null });
        setReview({ rating: 5, comment: '' });
        fetchOrders(); // Refresh orders
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      
      <div className="grid gap-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">Order #{order._id.slice(-6)}</h2>
                <p className="text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(order.priority)}`}>
                {order.priority}
              </span>
            </div>

            <div className="space-y-2">
              <p><span className="font-medium">Status:</span> {order.status}</p>
              <p><span className="font-medium">Total:</span> ${order.totalPrice}</p>
            </div>

            {/* Services List */}
            <div className="mt-4">
              <h3 className="font-medium mb-2">Services:</h3>
              <ul className="space-y-1">
                {order.services.map((service, idx) => (
                  <li key={idx} className="text-sm text-gray-600">
                    {service.name} - ${service.price}
                  </li>
                ))}
              </ul>
            </div>

            {/* Order History */}
            <div className="mt-4">
              <h3 className="font-medium mb-2">History:</h3>
              <div className="space-y-2">
                {order.history.map((hist, idx) => (
                  <div key={idx} className="text-sm text-gray-600">
                    {hist.status} - {new Date(hist.timestamp).toLocaleString()}
                  </div>
                ))}
              </div>
            </div>

            {/* Review Button */}
            {order.status === 'Completed' && (
              <button
                onClick={() => setReviewModal({ isOpen: true, orderId: order._id })}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Leave Review
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Leave a Review</h2>
            
            <div className="mb-4">
              <label className="block mb-2">Rating</label>
              <select
                value={review.rating}
                onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })}
                className="w-full border rounded p-2"
              >
                {[5, 4, 3, 2, 1].map((num) => (
                  <option key={num} value={num}>{num} Stars</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2">Comment</label>
              <textarea
                value={review.comment}
                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                className="w-full border rounded p-2"
                rows="4"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setReviewModal({ isOpen: false, orderId: null })}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}