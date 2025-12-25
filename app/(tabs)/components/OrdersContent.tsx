import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import OrderFilterTabs from './OrderFilterTabs';
import api from '../../../api/axiosInstance';
import { useAuth } from '../../../context/AuthContext';

const OrdersContent: React.FC = () => {
  const params = useLocalSearchParams();
  const initialFilter = (params.filter as string) || 'Active';
  const [selectedFilter, setSelectedFilter] = useState(initialFilter);
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  // Update filter when params change (e.g., when redirected from dispute submission)
  useEffect(() => {
    if (params.filter && params.filter !== selectedFilter) {
      setSelectedFilter(params.filter as string);
    }
  }, [params.filter]);

  // Sample order data (commented out - keeping for reference)
  /*
  const orders = [
    { 
      id: '1', 
      name: 'Julian King',
      location: 'San Francisco, CA',
      description: "I'll sing and perform at your son's Birthday event.",
      date: '12/05/2024',
      status: 'Active',
      image: require('../../../assets/images/profile1.png'),
      hasStatus: true
    },
    { 
      id: '2', 
      name: 'Ronald Richards',
      location: 'San Francisco, CA',
      description: "I'll perform as a DJ at your office party.",
      date: '12/05/2024',
      status: 'Active',
      image: require('../../../assets/images/profile1.png'),
      hasStatus: true
    },
    { 
      id: '3', 
      name: 'Kristin Watson',
      location: 'San Francisco, CA',
      description: "I'll sing at you wedding on this date and time.",
      date: '12/05/2024',
      status: 'Active',
      image: require('../../../assets/images/profile1.png'),
      hasStatus: true
    },
    { 
      id: '4', 
      name: 'Julian King',
      location: 'San Francisco, CA',
      description: "I'll sing and perform at your son's Birthday event.",
      date: '12/05/2024',
      status: 'Complete',
      image: require('../../../assets/images/profile1.png'),
      hasStatus: false
    },
    { 
      id: '5', 
      name: 'Ronald Richards',
      location: 'San Francisco, CA',
      description: "I'll perform as a DJ at your office party.",
      date: '12/05/2024',
      status: 'Complete',
      image: require('../../../assets/images/profile1.png'),
      hasStatus: false
    },
    { 
      id: '6', 
      name: 'Kristin Watson',
      location: 'San Francisco, CA',
      description: "I'll sing at you wedding on this date and time.",
      date: '12/05/2024',
      status: 'Complete',
      image: require('../../../assets/images/profile1.png'),
      hasStatus: true
    },
    { 
      id: '7', 
      name: 'Julian King',
      location: 'San Francisco, CA',
      description: "I'll sing and perform at your son's Birthday event.",
      date: '12/05/2024',
      status: 'Canceled',
      image: require('../../../assets/images/profile1.png'),
      hasStatus: false
    },
    { 
      id: '8', 
      name: 'Kristin Watson',
      location: 'San Francisco, CA',
      description: "I'll sing at you wedding on this date and time.",
      date: '12/05/2024',
      status: 'Disputes',
      image: require('../../../assets/images/profile1.png'),
      hasStatus: false
    },
  ];
  */

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      console.log('[OrdersContent] Fetching orders - user:', user?.userId, 'authLoading:', authLoading, 'selectedFilter:', selectedFilter);
      
      // Wait for auth to finish loading
      if (authLoading) {
        console.log('[OrdersContent] Auth still loading, waiting...');
        return;
      }
      
      // Check if user is authenticated
      if (!isAuthenticated) {
        console.log('[OrdersContent] User not authenticated, skipping fetch');
        setLoading(false);
        return;
      }
      
      // Check if user exists and has userId
      // Also check if userId might be in _id field (from backend)
      const userId = user?.userId || (user?._id && typeof user._id === 'string' ? user._id : user?._id?.toString?.());
      
      // If authenticated but no user object, still try to fetch (backend will extract userId from token)
      if (!userId) {
        console.log('[OrdersContent] No userId in user object, but authenticated. Backend will extract from token. User:', user);
      } else {
        console.log('[OrdersContent] User found with userId:', userId);
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('[OrdersContent] Making API call to /api/orders/buyer');
        // Fetch all orders - we'll filter on frontend since "Active" includes multiple backend statuses
        const response = await api.get('/api/orders/buyer');
        
        console.log('[OrdersContent] API Response:', {
          success: response.data.success,
          dataLength: response.data.data?.length || 0,
          count: response.data.count,
          data: response.data.data
        });

        if (response.data.success) {
          // Transform API data to match component expectations
          const transformedOrders = response.data.data.map((order: any) => ({
            id: order.id,
            name: order.name,
            location: order.location,
            description: order.description,
            jobTitle: order.jobTitle || order.description || 'Order', // Use jobTitle if available
            date: order.date,
            status: order.status,
            image: order.image 
              ? { uri: order.image } 
              : require('../../../assets/images/profile1.png'),
            hasStatus: order.hasStatus || false,
            sellerId: order.sellerId,
          }));
          console.log('[OrdersContent] Transformed orders:', transformedOrders.length, transformedOrders);
          setOrders(transformedOrders);
        } else {
          console.error('[OrdersContent] API returned success: false', response.data.message);
          setError(response.data.message || 'Failed to fetch orders');
          setOrders([]);
        }
      } catch (err: any) {
        console.error('[OrdersContent] Error fetching orders:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url
        });
        setError(err.response?.data?.message || 'Failed to fetch orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, user?.userId, authLoading, isAuthenticated, selectedFilter]);

  // Filter orders based on selected filter
  const filteredOrders = orders.filter((order) => {
    if (selectedFilter === 'Active') {
      // Active includes orders with status 'Active' (which maps from 'Pending' or 'Delivered')
      return order.status === 'Active';
    } else if (selectedFilter === 'Complete') {
      // Complete includes orders with status 'Complete'
      return order.status === 'Complete';
    } else if (selectedFilter === 'Canceled') {
      // Canceled includes orders with status 'Canceled' (mapped from 'Cancelled' or 'Rejected' in backend)
      return order.status === 'Canceled' || order.status === 'Cancelled';
    } else if (selectedFilter === 'Disputes') {
      // Disputes - filter orders with status 'Disputes'
      return order.status === 'Disputes';
    } else {
      return order.status === selectedFilter;
    }
  });

  const handleProfileImagePress = (order: any) => {
    // Navigate to seller profile page
    const sellerId = order.sellerId || order.id;
    console.log('Profile pressed:', sellerId);
    
    // If the user has status stories, navigate to status page
    if (order.hasStatus) {
      router.push({
        pathname: '/(tabs)/status',
        params: { id: sellerId, name: order.name }
      });
    } else {
      // Otherwise navigate to regular profile page
      router.push(`/(tabs)/profile?id=${sellerId}`);
    }
  };
  
  const handleProfileNamePress = (order: any) => {
    // Navigate to seller profile page
    const sellerId = order.sellerId || order.id;
    console.log('Profile pressed:', sellerId);
    router.push(`/(tabs)/profile?id=${sellerId}`);
  };

  const handleOptionsPress = (orderId: string) => {
    setShowOptions(showOptions === orderId ? null : orderId);
  };

  const handleViewDetails = (orderId: string) => {
    setShowOptions(null);
    console.log('View details for order:', orderId);
    // Navigate to order details page
    router.push({
      pathname: '/(tabs)/order_details',
      params: { id: orderId }
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-white-50 border-red-400';
      case 'Complete':
        return 'bg-[rgba(40,204,47,1)] border-[rgba(40,204,47,1)]';
      case 'Canceled':
        return 'bg-[rgba(242,38,76,1)] border-[rgba(242,38,76,1)]';
      case 'Disputes':
         return 'bg-[rgba(249,179,0,1)] border-[rgba(249,179,0,1)]';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-black-600';
      case 'Complete':
        return 'text-white-600';
      case 'Canceled':
        return 'text-white-600';
      case 'Disputes':
        return 'text-white-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <View className="flex-1 bg-white">
      <OrderFilterTabs
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />
      <ScrollView className="flex-1">
        {loading ? (
          <View className="flex-1 justify-center items-center p-8">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-500 mt-4">Loading orders...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center p-8">
            <Text className="text-center text-red-500 text-base mb-2">{error}</Text>
            <Text className="text-center text-gray-500 text-sm">
              Please try again later.
            </Text>
          </View>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              className="px-4 py-4 bg-white"
              onPress={async () => {
                console.log('[OrdersContent] Order clicked, checking payment status:', order.id);
                try {
                  // Check if payment already exists
                  const paymentCheck = await api.get(`/api/payments/check/${order.id}`);
                  if (paymentCheck.data.success && paymentCheck.data.data.hasPayment) {
                    // Payment already done, go to order details
                    console.log('[OrdersContent] Payment already done, navigating to order details');
                    router.push({
                      pathname: '/(tabs)/order_details',
                      params: { id: order.id }
                    });
                  } else {
                    // No payment, go to payment page
                    console.log('[OrdersContent] No payment found, navigating to payment page');
                    router.push({
                      pathname: '/(tabs)/payment',
                      params: { orderId: order.id }
                    });
                  }
                } catch (err: any) {
                  console.error('[OrdersContent] Error checking payment status:', err);
                  // On error, still navigate to payment page
                  router.push({
                    pathname: '/(tabs)/payment',
                    params: { orderId: order.id }
                  });
                }
              }}
            >
              <View className="border border-gray-200 rounded-lg p-3 bg-white">
                <View className="flex-row">
                  <TouchableOpacity 
                    onPress={() => handleProfileImagePress(order)}
                    className="mr-3"
                  >
                    <View className="relative">
                      <Image
                        source={order.image}
                        className="w-14 h-14 rounded-full"
                        style={{ resizeMode: 'cover' }}
                      />
                      {order.hasStatus && (
                        <View className="absolute inset-0 border-2 border-pink-500 rounded-full" />
                      )}
                    </View>
                  </TouchableOpacity>
                  <View className="flex-1">
                    <TouchableOpacity onPress={() => handleProfileNamePress(order)}>
                      <View className="flex-row justify-between items-start mb-1">
                      <Text className="text-sm font-semibold text-black">{order.name}</Text>
                      <View className={`px-3 py-1 rounded-lg border ${getStatusStyle(order.status)}`}>
                        <Text className={`text-xs font-medium ${getStatusTextStyle(order.status)}`}>
                          {order.status}
                        </Text>
                      </View>
                    </View>
                    </TouchableOpacity>
                    <Text className="text-xs text-gray-500 mb-2">{order.location}</Text>
                  </View>
                </View>
                
                {/* Job Title/Order Name - Display the actual order name */}
                <Text className="text-base font-semibold text-gray-900 mb-2 mt-2">
                  {order.jobTitle || order.description || 'Order'}
                </Text>
                
                {/* Description below the photo */}
                {order.jobTitle && order.description && order.jobTitle !== order.description && (
                  <Text className="text-sm text-gray-700 leading-5 mb-4">{order.description}</Text>
                )}
                
                {/* Date section with border-top and options */}
                <View className="flex-row justify-between items-center border-t border-gray-200 pt-3">
                  <Text className="text-sm text-gray-600 font-medium">{order.date}</Text>
                  <View className="relative">
                    <TouchableOpacity 
                      onPress={() => handleOptionsPress(order.id)}
                      className="p-2"
                    >
                      <Text className="text-xl text-gray-400">⋮</Text>
                    </TouchableOpacity>
                    {showOptions === order.id && (
                      <View className="absolute right-0 top-10 bg-white shadow-lg rounded-lg py-2 px-4 z-10 border border-gray-200 min-w-32">
                        <TouchableOpacity onPress={() => handleViewDetails(order.id)}>
                          <Text className="text-gray-800 py-2 text-sm">View Details</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 justify-center items-center p-8">
            <Text className="text-center text-gray-500 text-base font-medium mb-2">
              No {selectedFilter.toLowerCase()} orders found.
            </Text>
            {orders.length === 0 && selectedFilter === 'Active' && (
              <Text className="text-center text-gray-400 text-sm mt-2">
                When you accept a custom offer, it will appear here.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default OrdersContent;