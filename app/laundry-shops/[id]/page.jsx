'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MapPin, Star, Calendar, Clock, ArrowLeft, CloudRain, Sun, Cloud, Loader, MessageSquare, Send, ThumbsUp } from 'lucide-react';
import Link from 'next/link';

export default function LaundryShopDetailPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  // Weather forecast state
  const [weatherForecast, setWeatherForecast] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  
  // Location states
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  
  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewServiceType, setReviewServiceType] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  
  // Default location for Dhaka, Bangladesh
  const DEFAULT_LOCATION = {
    latitude: 23.8103,
    longitude: 90.4125,
    address: 'Dhaka, Bangladesh'
  };
  
  // Generate available dates (next 7 days)
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });
  
  // Available time slots
  const timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '01:00 PM - 02:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM'
  ];
  
  // Available service types for reviews
  const serviceTypes = [
    'Washing',
    'Ironing',
    'Dry Cleaning',
    'Multiple Services'
  ];

  useEffect(() => {
    fetchShopDetails();
    fetchReviews();
    getUserLocation();
  }, [id]);

  // Fetch weather when date and time slot are selected
  useEffect(() => {
    if (selectedDate && selectedTimeSlot && shop) {
      fetchWeatherForecast();
    } else {
      setWeatherForecast(null);
    }
  }, [selectedDate, selectedTimeSlot, shop]);

  const getUserLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    
    // Check if geolocation is available in the browser
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // Success callback
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Optional: Reverse geocoding to get address (using Nominatim OpenStreetMap)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            
            if (response.ok) {
              const data = await response.json();
              const address = data?.display_name || 'Your current location';
              
              setUserLocation({
                latitude,
                longitude,
                address
              });
            } else {
              // If reverse geocoding fails, still set coordinates
              setUserLocation({
                latitude,
                longitude,
                address: 'Your current location'
              });
            }
          } catch (error) {
            // If reverse geocoding fails, still set coordinates
            setUserLocation({
              latitude,
              longitude,
              address: 'Your current location'
            });
          } finally {
            setLocationLoading(false);
          }
        },
        // Error callback
        (error) => {
          setLocationError(
            error.code === 1
              ? 'Location permission denied. Using default location.'
              : 'Unable to get your location. Using default location.'
          );
          setUserLocation(DEFAULT_LOCATION);
          setLocationLoading(false);
        },
        // Options
        { timeout: 10000 }
      );
    } else {
      // Browser doesn't support geolocation
      setLocationError("Your browser doesn't support geolocation. Using default location.");
      setUserLocation(DEFAULT_LOCATION);
      setLocationLoading(false);
    }
  };

  const fetchShopDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/laundry-shops/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch laundry shop details');
      }
      
      const data = await response.json();
      
      // If shop doesn't have location coordinates, add the default coordinates
      if (!data.shop?.location?.coordinates) {
        data.shop = {
          ...data.shop,
          location: {
            ...data.shop.location,
            coordinates: {
              latitude: DEFAULT_LOCATION.latitude,
              longitude: DEFAULT_LOCATION.longitude
            }
          }
        };
      }
      
      setShop(data.shop);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await fetch(`/api/laundry-shops/${id}/reviews`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchWeatherForecast = async () => {
    try {
      setWeatherLoading(true);
      setWeatherError(null);
      
      // More robust coordinate extraction
      const shopCoords = shop?.location?.coordinates;
      
      // First try shop coordinates, then user location, then default location
      // Extract each property individually to avoid undefined objects
      const coordinates = {
        latitude: shopCoords?.latitude || userLocation?.latitude || DEFAULT_LOCATION.latitude,
        longitude: shopCoords?.longitude || userLocation?.longitude || DEFAULT_LOCATION.longitude
      };
      
      // Verify coordinates are valid before proceeding
      if (!coordinates.latitude || !coordinates.longitude) {
        throw new Error("Valid location coordinates not available");
      }
      
      // Extract hour from time slot (e.g., "09:00 AM - 10:00 AM" -> 9)
      const hourMatch = selectedTimeSlot.match(/(\d+):00\s([AP]M)/);
      if (!hourMatch) {
        throw new Error("Could not parse time slot");
      }
      
      let hour = parseInt(hourMatch[1]);
      const ampm = hourMatch[2];
      
      // Convert to 24-hour format
      if (ampm === 'PM' && hour !== 12) {
        hour += 12;
      } else if (ampm === 'AM' && hour === 12) {
        hour = 0;
      }
      
      // Create target datetime for the forecast
      const targetDate = new Date(selectedDate);
      targetDate.setHours(hour, 0, 0, 0);
      
      // Use OpenWeatherMap API (free tier)
      const { latitude, longitude } = coordinates;
      const apiKey = 'dac6cd8db807cc9f474781365e805727'; // Replace with your API key or use environment variable
      
      console.log(`Fetching weather for coordinates: lat=${latitude}, lon=${longitude}`);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
      );
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Weather API error:', errorData);
        throw new Error(`Failed to fetch weather forecast: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Find the closest forecast to our target time
      // OpenWeatherMap free tier provides forecasts in 3-hour steps
      const forecasts = data.list;
      
      if (!forecasts || forecasts.length === 0) {
        throw new Error('No forecast data available');
      }
      
      let closestForecast = null;
      let minTimeDiff = Infinity;
      
      for (const forecast of forecasts) {
        const forecastTime = new Date(forecast.dt * 1000);
        const timeDiff = Math.abs(forecastTime.getTime() - targetDate.getTime());
        
        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          closestForecast = forecast;
        }
      }
      
      if (closestForecast) {
        setWeatherForecast({
          temp: Math.round(closestForecast.main.temp),
          condition: closestForecast.weather[0].main,
          description: closestForecast.weather[0].description,
          icon: closestForecast.weather[0].icon,
          windSpeed: closestForecast.wind.speed,
          humidity: closestForecast.main.humidity
        });
      } else {
        throw new Error('No forecast available for selected time');
      }
    } catch (err) {
      console.error('Weather forecast error:', err);
      setWeatherError(err.message);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    
    if (status !== 'authenticated') {
      router.push(`/login?redirect=/laundry-shops/${id}`);
      return;
    }
    
    if (!selectedDate || !selectedTimeSlot) {
      setBookingError('Please select both date and time slot');
      return;
    }
    
    try {
      setBookingLoading(true);
      setBookingError(null);
      
      const response = await fetch('/api/appointments/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          laundryShopId: id,
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          service: selectedService || undefined
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book appointment');
      }
      
      setBookingSuccess(true);
      setSelectedDate('');
      setSelectedTimeSlot('');
      
      // Redirect to appointments page after successful booking
      setTimeout(() => {
        router.push('/appointments');
      }, 2000);
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };
  
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (status !== 'authenticated') {
      router.push(`/login?redirect=/laundry-shops/${id}?review=true`);
      return;
    }
    
    if (!reviewRating || !reviewTitle || !reviewComment || !reviewServiceType) {
      setReviewError('All fields are required');
      return;
    }
    
    try {
      setReviewSubmitting(true);
      setReviewError(null);
      
      const response = await fetch(`/api/laundry-shops/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
          serviceType: reviewServiceType
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }
      
      // Reset form
      setReviewRating(0);
      setReviewTitle('');
      setReviewComment('');
      setReviewServiceType('');
      setReviewSuccess(true);
      
      // Refresh reviews list and shop details (to update ratings)
      fetchReviews();
      fetchShopDetails();
      
      // Hide form after successful submission
      setTimeout(() => {
        setShowReviewForm(false);
        setReviewSuccess(false);
      }, 3000);
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (status !== 'authenticated') {
      router.push(`/login?redirect=/laundry-shops/${id}`);
      return;
    }
    
    try {
      const response = await fetch(`/api/laundry-shops/${id}/reviews/${reviewId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to like review');
      }
      
      // Refresh reviews to update like count
      fetchReviews();
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };

  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  };
  
  // Get weather icon based on condition
  const getWeatherIcon = (condition) => {
    condition = condition?.toLowerCase() || '';
    
    if (condition.includes('rain') || condition.includes('drizzle')) {
      return <CloudRain className="text-blue-500" size={24} />;
    } else if (condition.includes('clear')) {
      return <Sun className="text-yellow-500" size={24} />;
    } else {
      return <Cloud className="text-gray-500" size={24} />;
    }
  };

  // Group menu items by category
  const groupedMenu = shop?.menu?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {}) || {};
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-600">{error}</p>
          <Link href="/laundry-shops" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Laundry Shops
          </Link>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-yellow-600">Laundry shop not found</p>
          <Link href="/laundry-shops" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Laundry Shops
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/laundry-shops" className="flex items-center text-blue-600 hover:underline mb-4">
        <ArrowLeft className="mr-2" size={18} />
        Back to Laundry Shops
      </Link>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="h-64 bg-gray-200 relative">
          {/* Placeholder for shop image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-500 text-4xl">{shop.name.charAt(0)}</span>
          </div>
        </div>
        
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{shop.name}</h1>
          
          <div className="text-gray-600 mb-4 flex items-center">
            <MapPin className="mr-2" size={18} />
            <span>{shop.location?.address || 'Location not specified'}</span>
          </div>
          
          {/* Location Info */}
          <div className="mb-4 bg-blue-50 p-3 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="mr-2 text-blue-600" size={18} />
                <span className="text-sm font-medium">Your Location:</span>
              </div>
              
              {locationLoading ? (
                <div className="flex items-center">
                  <Loader className="animate-spin mr-2 text-blue-600" size={16} />
                  <span className="text-sm text-gray-600">Getting location...</span>
                </div>
              ) : (
                <button 
                  onClick={getUserLocation} 
                  className="text-sm text-blue-600 hover:underline flex items-center"
                >
                  <span>Refresh</span>
                </button>
              )}
            </div>
            
            {locationError ? (
              <div className="mt-2 text-sm">
                <p className="text-orange-600">{locationError}</p>
                <p>Using: {DEFAULT_LOCATION.address}</p>
              </div>
            ) : userLocation ? (
              <div className="mt-2 text-sm">
                <p>{userLocation.address}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-600">
                {!locationLoading && 'Location information not available. Using default.'}
              </p>
            )}
          </div>
          
          <div className="flex items-center mb-6">
            <div className="flex items-center">
              <Star className={`${calculateAverageRating(shop.ratings) >= 1 ? 'text-yellow-500' : 'text-gray-300'} mr-1`} size={18} fill={calculateAverageRating(shop.ratings) >= 1 ? "currentColor" : "none"} />
              <Star className={`${calculateAverageRating(shop.ratings) >= 2 ? 'text-yellow-500' : 'text-gray-300'} mr-1`} size={18} fill={calculateAverageRating(shop.ratings) >= 2 ? "currentColor" : "none"} />
              <Star className={`${calculateAverageRating(shop.ratings) >= 3 ? 'text-yellow-500' : 'text-gray-300'} mr-1`} size={18} fill={calculateAverageRating(shop.ratings) >= 3 ? "currentColor" : "none"} />
              <Star className={`${calculateAverageRating(shop.ratings) >= 4 ? 'text-yellow-500' : 'text-gray-300'} mr-1`} size={18} fill={calculateAverageRating(shop.ratings) >= 4 ? "currentColor" : "none"} />
              <Star className={`${calculateAverageRating(shop.ratings) >= 5 ? 'text-yellow-500' : 'text-gray-300'}`} size={18} fill={calculateAverageRating(shop.ratings) >= 5 ? "currentColor" : "none"} />
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {shop.ratings?.length || 0} reviews
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Services Menu */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Services</h2>
              
              <div className="space-y-6">
                {Object.keys(groupedMenu).map((category) => (
                  <div key={category}>
                    <h3 className="text-lg font-medium mb-3">{category}</h3>
                    
                    <div className="space-y-3">
                      {groupedMenu[category].map((item) => (
                        <div key={item._id} className="bg-gray-50 p-3 rounded-md">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{item.name}</h4>
                            <span className="font-medium text-blue-600">${item.price.toFixed(2)}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          <p className="text-xs text-gray-500 mt-1">Type: {item.clothType}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Booking Form */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Book an Appointment</h2>
              
              {bookingSuccess ? (
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="text-green-600">Appointment booked successfully! Redirecting to your appointments...</p>
                </div>
              ) : (
                <form onSubmit={handleBookAppointment} className="space-y-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
                      <select
                        id="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a date</option>
                        {availableDates.map((date) => (
                          <option key={date} value={date}>
                            {new Date(date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700 mb-1">
                      Time Slot
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 text-gray-400" size={16} />
                      <select
                        id="timeSlot"
                        value={selectedTimeSlot}
                        onChange={(e) => setSelectedTimeSlot(e.target.value)}
                        className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a time</option>
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Weather Forecast Section */}
                  {selectedDate && selectedTimeSlot && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Weather Forecast</h3>
                      
                      {weatherLoading ? (
                        <div className="bg-gray-50 p-3 rounded-md flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                          <span className="text-sm text-gray-600">Loading forecast...</span>
                        </div>
                      ) : weatherError ? (
                        <div className="bg-red-50 p-3 rounded-md">
                          <p className="text-sm text-red-600">Couldn't load weather forecast: {weatherError}</p>
                        </div>
                      ) : weatherForecast ? (
                        <div className="bg-blue-50 p-3 rounded-md">
                          <div className="flex items-center">
                            {getWeatherIcon(weatherForecast.condition)}
                            <div className="ml-3">
                              <p className="font-medium">{weatherForecast.condition}</p>
                              <p className="text-sm text-gray-600">{weatherForecast.description}</p>
                            </div>
                            <div className="ml-auto text-right">
                              <p className="font-medium">{weatherForecast.temp}°C</p>
                              <p className="text-xs text-gray-600">
                                Humidity: {weatherForecast.humidity}% • 
                                Wind: {weatherForecast.windSpeed} m/s
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-gray-600">Select a date and time to see the weather forecast.</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
                      Service (Optional)
                    </label>
                    <select
                      id="service"
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Services</option>
                      {Object.keys(groupedMenu).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {bookingError && (
                    <div className="bg-red-50 p-3 rounded-md">
                      <p className="text-red-600 text-sm">{bookingError}</p>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className={`w-full py-2 ${
                      bookingLoading
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white rounded-md transition duration-300 flex items-center justify-center`}
                  >
                    {bookingLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Book Appointment'
                    )}
                  </button>
                  
                  {status !== 'authenticated' && (
                    <p className="text-sm text-gray-600 mt-2">
                      You need to{' '}
                      <Link href={`/login?redirect=/laundry-shops/${id}`} className="text-blue-600 hover:underline">
                        log in
                      </Link>{' '}
                      to book an appointment.
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
          
          {/* Reviews Section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Customer Reviews</h2>
              
              {status === 'authenticated' && !showReviewForm && (
                <button 
                onClick={() => setShowReviewForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Write a Review
              </button>
            )}
          </div>
          
          {/* Review Form */}
          {showReviewForm && (
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-medium mb-4">Write Your Review</h3>
              
              {reviewSuccess ? (
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="text-green-600">Your review has been submitted successfully!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={24}
                          onClick={() => setReviewRating(star)}
                          fill={reviewRating >= star ? 'currentColor' : 'none'}
                          className={`${
                            reviewRating >= star ? 'text-yellow-500' : 'text-gray-300'
                          } mr-1 cursor-pointer hover:text-yellow-400`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="reviewServiceType" className="block text-sm font-medium text-gray-700 mb-1">
                      Service Type
                    </label>
                    <select
                      id="reviewServiceType"
                      value={reviewServiceType}
                      onChange={(e) => setReviewServiceType(e.target.value)}
                      className="w-full py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Service Type</option>
                      {serviceTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="reviewTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      id="reviewTitle"
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Summarize your experience"
                      maxLength={100}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="reviewComment" className="block text-sm font-medium text-gray-700 mb-1">
                      Comment
                    </label>
                    <textarea
                      id="reviewComment"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={4}
                      className="w-full py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Share details of your experience"
                      maxLength={500}
                    />
                  </div>
                  
                  {reviewError && (
                    <div className="bg-red-50 p-3 rounded-md">
                      <p className="text-red-600 text-sm">{reviewError}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className={`py-2 px-4 {
                        reviewSubmitting
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white rounded-md transition duration-300 flex items-center justify-center`}
                    >
                      {reviewSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        'Submit Review'
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
          
          {/* Reviews List */}
          <div className="space-y-6">
            {reviewsLoading ? (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            fill={review.rating >= star ? 'currentColor' : 'none'}
                            className={`৳{
                              review.rating >= star ? 'text-yellow-500' : 'text-gray-300'
                            } mr-1`}
                          />
                        ))}
                        <span className="ml-1 text-sm font-medium">{review.serviceType}</span>
                      </div>
                      <h4 className="font-medium">{review.title}</h4>
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                  </div>
                  
                  <p className="text-gray-700 mt-2">{review.comment}</p>
                  
                  <div className="mt-3 flex items-center">
                    <button
                      onClick={() => handleLikeReview(review._id)}
                      className="flex items-center text-gray-500 hover:text-blue-600 text-sm"
                    >
                      <ThumbsUp 
                        size={14} 
                        className="mr-1" 
                        fill={review.likes?.includes(session?.user?.id) ? 'currentColor' : 'none'} 
                      />
                      <span>{review.likes?.length || 0}</span>
                    </button>
                    
                    <span className="mx-2 text-xs text-gray-400">•</span>
                    <span className="text-sm text-gray-500">{review.user?.name || 'Anonymous'}</span>
                  </div>
                  
                  {/* Owner Response */}
                  {review.isOwnerResponded && review.ownerResponse && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-300">
                      <p className="text-sm font-medium">Owner Response:</p>
                      <p className="text-sm text-gray-700">{review.ownerResponse.comment}</p>
                      <span className="text-xs text-gray-500">
                        {formatDate(review.ownerResponse.respondedAt)}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <MessageSquare className="mx-auto mb-3 text-gray-400" size={24} />
                <p className="text-gray-600">No reviews yet.</p>
                <p className="text-sm text-gray-500 mt-1">Be the first to leave a review!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
}