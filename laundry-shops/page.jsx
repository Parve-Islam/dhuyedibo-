// app/laundry-shops/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Star, Search, Filter } from 'lucide-react';

export default function LaundryShopsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || ''
  });

  useEffect(() => {
    fetchLaundryShops();
  }, [searchParams]);

  const fetchLaundryShops = async () => {
    try {
      setLoading(true);
      const page = searchParams.get('page') || '1';
      const location = searchParams.get('location') || '';
      const category = searchParams.get('category') || '';
      
      const response = await fetch(`/api/laundry-shops?page=${page}&location=${location}&category=${category}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch laundry shops');
      }
      
      const data = await response.json();
      setShops(data.shops);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (filters.location) params.set('location', filters.location);
    if (filters.category) params.set('category', filters.category);
    
    router.push(`/laundry-shops?${params.toString()}`);
  };

  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    router.push(`/laundry-shops?${params.toString()}`);
  };

  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Find Laundry Services</h1>
      
      {/* Filters Section */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <form onSubmit={applyFilters} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                id="location"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Enter your location"
                className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="w-full md:w-64">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-3 text-gray-400" size={16} />
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Services</option>
                <option value="Washing">Washing</option>
                <option value="Ironing">Ironing</option>
                <option value="Dry Cleaning">Dry Cleaning</option>
              </select>
            </div>
          </div>
          
          <div className="self-end">
            <button
              type="submit"
              className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
            >
              <Search className="mr-2" size={16} />
              Search
            </button>
          </div>
        </form>
      </div>
      
      {/* Results Section */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      ) : shops.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-md text-center">
          <h2 className="text-xl font-semibold mb-2">No laundry shops found</h2>
          <p className="text-gray-600">Try adjusting your filters or search for a different location.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Link href={`/laundry-shops/${shop._id}`} key={shop._id} className="block">
                <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition duration-300">
                  <div className="h-40 bg-gray-200 relative">
                    {/* Placeholder for shop image */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-gray-500 text-lg">{shop.name.charAt(0)}</span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h2 className="text-xl font-semibold mb-2">{shop.name}</h2>
                    <p className="text-gray-600 mb-2 flex items-center">
                      <MapPin className="mr-1" size={14} />
                      {shop.location.address}
                    </p>
                    
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        <Star 
                          className={`${calculateAverageRating(shop.ratings) >= 1 ? 'text-yellow-500' : 'text-gray-300'} mr-1`} 
                          size={16} 
                          fill={calculateAverageRating(shop.ratings) >= 1 ? "currentColor" : "none"} 
                        />
                        <Star 
                          className={`${calculateAverageRating(shop.ratings) >= 2 ? 'text-yellow-500' : 'text-gray-300'} mr-1`} 
                          size={16} 
                          fill={calculateAverageRating(shop.ratings) >= 2 ? "currentColor" : "none"} 
                        />
                        <Star 
                          className={`${calculateAverageRating(shop.ratings) >= 3 ? 'text-yellow-500' : 'text-gray-300'} mr-1`} 
                          size={16} 
                          fill={calculateAverageRating(shop.ratings) >= 3 ? "currentColor" : "none"} 
                        />
                        <Star 
                          className={`${calculateAverageRating(shop.ratings) >= 4 ? 'text-yellow-500' : 'text-gray-300'} mr-1`} 
                          size={16} 
                          fill={calculateAverageRating(shop.ratings) >= 4 ? "currentColor" : "none"} 
                        />
                        <Star 
                          className={`${calculateAverageRating(shop.ratings) >= 5 ? 'text-yellow-500' : 'text-gray-300'}`} 
                          size={16} 
                          fill={calculateAverageRating(shop.ratings) >= 5 ? "currentColor" : "none"} 
                        />
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {shop.ratings?.length || 0} reviews
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Array.from(new Set(shop.menu.map(item => item.category))).map((category, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {category}
                        </span>
                      ))}
                    </div>
                    
                    <button className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
                      Book Appointment
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-3 py-1 rounded-md ${
                    pagination.page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 rounded-md ${
                      pagination.page === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className={`px-3 py-1 rounded-md ${
                    pagination.page === pagination.pages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}