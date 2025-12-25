import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import Assets from '../../assets';
import "../global.css";
import AlertModal from './components/AlertModal';
import Header from './components/MainHeader';
import OrderFilterTabs from './components/OrderFilterTabs';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import ChatScreen from './components/messages/ChatScreen';

const OrderDetails: React.FC = () => {
  const params = useLocalSearchParams();
  const orderId = params.id as string;
  
  const [activeTab, setActiveTab] = useState('Track Order');
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [orderDataFromApi, setOrderDataFromApi] = useState<any>(null);
  const [disputeData, setDisputeData] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState({
    sellerOffer: false, // Open by default to match design
    payment: false,
    orderSchedule: false,
    orderModification: false,
    orderDelivery: false,
    orderCompletion: false,
    orderComplete: false,
    review: false,
    dispute: false
  });
  
  // Modal states
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  
  // Resolution center selection states
  const [selectedOptions, setSelectedOptions] = useState({
    requestModification: false,
    cancelOrder: false
  });
  
  // Form states for modals
  const [disputeForm, setDisputeForm] = useState({
    orderNo: '',
    subject: '',
    description: ''
  });
  const [disputeAttachments, setDisputeAttachments] = useState<any[]>([]);
  const [submittingDispute, setSubmittingDispute] = useState(false);
  
  const [cancelReason, setCancelReason] = useState('');
  const [customCancelReason, setCustomCancelReason] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Add these state variables at the top with other state declarations
  const [orderStatus, setOrderStatus] = useState('Delivered'); // Initial status
  const [showOrderComplete, setShowOrderComplete] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [rating, setRating] = useState(4);
  const [reviewText, setReviewText] = useState('');
  const [reviewDate, setReviewDate] = useState<string | null>(null);

  // Add these state variables for the chat UI
  const [showChatOptions, setShowChatOptions] = useState(false);

  // Add these state variables at the top with other state declarations
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showReasonOptions, setShowReasonOptions] = useState(false);
  const [customRejectionReason, setCustomRejectionReason] = useState('');
  const [selectedRejectionReason, setSelectedRejectionReason] = useState('');
  const [isOrderRejected, setIsOrderRejected] = useState(false);

  // Add these state variables with your other state declarations
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  const { isAuthenticated } = useAuth();

  // Fetch order and payment data
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      if (!isAuthenticated) {
        setLoading(false);
        router.replace('/(auth)/Signin');
        return;
      }

      try {
        setLoading(true);
        
        // Fetch order details
        const orderResponse = await api.get(`/api/orders/buyer/${orderId}`);
        if (orderResponse.data.success) {
          setOrderDataFromApi(orderResponse.data.data);
        } else {
          Alert.alert('Error', orderResponse.data.message || 'Failed to load order details');
        }

        // Fetch payment details
        try {
          const paymentResponse = await api.get(`/api/payments/order/${orderId}`);
          if (paymentResponse.data.success) {
            setPaymentData(paymentResponse.data.data);
          }
        } catch (paymentErr: any) {
          // Payment might not exist yet, that's okay
          console.log('[OrderDetails] No payment found for order:', orderId);
        }

        // Fetch review if it exists
        try {
          const reviewResponse = await api.get(`/api/reviews/order/${orderId}`);
          if (reviewResponse.data.success && reviewResponse.data.data) {
            setReviewSubmitted(true);
            setRating(reviewResponse.data.data.rating);
            setReviewText(reviewResponse.data.data.text);
            setReviewDate(reviewResponse.data.data.createdAt || reviewResponse.data.data.date);
            setExpandedSections(prev => ({
              ...prev,
              review: false, // Start collapsed
            }));
          }
        } catch (reviewErr: any) {
          // Review might not exist yet, that's okay
          console.log('[OrderDetails] No review found for order:', orderId);
        }

        // Fetch dispute if it exists
        try {
          const disputeResponse = await api.get(`/api/disputes/order/${orderId}`);
          if (disputeResponse.data.success && disputeResponse.data.data) {
            setDisputeData(disputeResponse.data.data);
            setExpandedSections(prev => ({
              ...prev,
              dispute: false, // Start collapsed
            }));
          }
        } catch (disputeErr: any) {
          // Dispute might not exist yet, that's okay
          console.log('[OrderDetails] No dispute found for order:', orderId);
        }
      } catch (err: any) {
        console.error('[OrderDetails] Error fetching order data:', err);
        if (err.response?.status === 401) {
          Alert.alert("Session Expired", "Your session has expired. Please sign in again.");
          router.replace('/(auth)/Signin');
        } else {
          Alert.alert('Error', err.response?.data?.message || 'Failed to load order details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, isAuthenticated]);

  // Helper functions for data formatting
  const genresOptions = ['Jazz', 'Country', 'Gospel', 'Christian', 'RnB', 'Pop', 'Blues', 'Funk'];
  const languageOptions = ['English', 'French', 'Spanish', 'Hindi', 'Urdu'];

  const getGenreNames = (genres: any[]) => {
    if (!genres || genres.length === 0) return [];
    return genres.map(g => {
      if (typeof g === 'object' && g.name) return g.name;
      const id = typeof g === 'object' ? g.id : g;
      const index = id - 1;
      return index >= 0 && index < genresOptions.length ? genresOptions[index] : `Genre ${id}`;
    });
  };

  const getLanguageNames = (languages: any[]) => {
    if (!languages || languages.length === 0) return [];
    return languages.map(l => {
      if (typeof l === 'object' && l.name) return l.name;
      const id = typeof l === 'object' ? l.id : l;
      const index = id - 1;
      return index >= 0 && index < languageOptions.length ? languageOptions[index] : `Language ${id}`;
    });
  };

  const getServiceNames = (services: any[]) => {
    if (!services || services.length === 0) return [];
    return services.map(s => {
      if (typeof s === 'string') return s;
      if (typeof s === 'object' && s.name) return s.name;
      return `Service ${s}`;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}kbs`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}mb`;
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'TBD';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const formatTime = (time: string | Date | undefined) => {
    if (!time) return 'TBD';
    const t = typeof time === 'string' ? new Date(time) : time;
    return t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Calculate time remaining for delivered orders (48 hours to approve/reject)
  const calculateTimeRemaining = (completionRequestDate: Date | string | undefined) => {
    if (!completionRequestDate) return 'N/A';
    const requestDate = typeof completionRequestDate === 'string' ? new Date(completionRequestDate) : completionRequestDate;
    const deadline = new Date(requestDate.getTime() + 48 * 60 * 60 * 1000); // 48 hours from request
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}D : ${hours}Hr : ${minutes}Min`;
  };
  
  const handleNotificationPress = () => {
    console.log('Notification icon pressed');
    // Navigate to the notifications page
    router.push('/(tabs)/notifications');
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const toggleOption = (option: keyof typeof selectedOptions) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
  const handleRequestAction = () => {
    // Handle request action based on selected options
    if (selectedOptions.cancelOrder) {
      setShowCancelModal(true);
    } else if (selectedOptions.requestModification) {
      // Handle modification request
      console.log('Request action for modification');
    } else {
      // If no option is selected, show an alert
      Alert.alert('Please select an option', 'Please select an option before requesting action');
    }
  };
  
  const handleSubmitDispute = () => {
    setShowDisputeModal(true);
  };

  const handlePickDisputeFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'audio/*'],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const newAttachments = result.assets.map(asset => ({
          name: asset.name,
          uri: asset.uri,
          type: asset.mimeType || 'application/octet-stream',
          size: asset.size || 0,
        }));
        setDisputeAttachments(prev => [...prev, ...newAttachments]);
      }
    } catch (error) {
      console.error('Error picking files:', error);
      Alert.alert('Error', 'Failed to pick files');
    }
  };

  const handleRemoveDisputeAttachment = (index: number) => {
    setDisputeAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitDisputeForm = async () => {
    // Validate form
    if (!disputeForm.orderNo.trim()) {
      Alert.alert('Error', 'Please enter order number');
      return;
    }
    if (!disputeForm.subject.trim()) {
      Alert.alert('Error', 'Please enter subject');
      return;
    }
    if (!disputeForm.description.trim()) {
      Alert.alert('Error', 'Please enter description');
      return;
    }

    if (disputeForm.description.length > 1000) {
      Alert.alert('Error', 'Description must be 1000 characters or less');
      return;
    }

    setSubmittingDispute(true);
    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('orderNo', disputeForm.orderNo.trim());
      formData.append('subject', disputeForm.subject.trim());
      formData.append('description', disputeForm.description.trim());

      // Append attachments
      disputeAttachments.forEach((attachment, index) => {
        const fileUri = attachment.uri;
        const fileName = attachment.name || `attachment_${index}`;
        const fileType = attachment.type || 'application/octet-stream';

        formData.append('attachments', {
          uri: fileUri,
          name: fileName,
          type: fileType,
        } as any);
      });

      // Submit dispute
      // Note: Explicitly set Content-Type header like in useSendMessage.ts (working pattern)
      const response = await api.post(`/api/disputes/order/${orderId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        // Refetch dispute data to display in timeline
        try {
          const disputeResponse = await api.get(`/api/disputes/order/${orderId}`);
          if (disputeResponse.data.success && disputeResponse.data.data) {
            setDisputeData(disputeResponse.data.data);
            setExpandedSections(prev => ({
              ...prev,
              dispute: true, // Expand dispute section after submission
            }));
          }
        } catch (disputeErr: any) {
          console.log('[OrderDetails] Error fetching dispute after submission:', disputeErr);
        }

        Alert.alert('Success', 'Dispute submitted successfully');
        setShowDisputeModal(false);
        // Reset form
        setDisputeForm({ orderNo: '', subject: '', description: '' });
        setDisputeAttachments([]);
        
        // Redirect to orders page with 'Disputes' filter selected
        router.push({
          pathname: '/(tabs)/orders',
          params: { filter: 'Disputes' }
        });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to submit dispute');
      }
    } catch (error: any) {
      console.error('Error submitting dispute:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.message || 
                          (error.response?.data?.errors ? error.response.data.errors.join(', ') : null) ||
                          'Failed to submit dispute';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmittingDispute(false);
    }
  };
  
  // Get status color and background based on status
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending':
        return { textColor: 'text-yellow-500', bgColor: 'bg-yellow-500', borderColor: 'border-yellow-500' };
      case 'Delivered':
        return { textColor: 'text-yellow-500', bgColor: 'bg-yellow-500', borderColor: 'border-yellow-500' };
      case 'Rejected':
        return { textColor: 'text-red-500', bgColor: 'bg-red-500', borderColor: 'border-red-500' };
      case 'Complete':
        return { textColor: 'text-green-500', bgColor: 'bg-green-500', borderColor: 'border-green-500' };
      default:
        return { textColor: 'text-gray-500', bgColor: 'bg-gray-500', borderColor: 'border-gray-500' };
    }
  };

  const handleApproveCompletion = async () => {
    try {
      // Make API call to approve completion
      const response = await api.patch(`/api/orders/${orderId}/complete`, {
        status: 'Complete',
      });
      
      if (response.data.success) {
        // Refetch order data
        const orderResponse = await api.get(`/api/orders/buyer/${orderId}`);
        if (orderResponse.data.success) {
          setOrderDataFromApi(orderResponse.data.data);
        }
        
        setOrderStatus('Complete');
    setShowOrderComplete(true);
    setExpandedSections(prev => ({
      ...prev,
      orderCompletion: false,
      orderComplete: true
    }));
        Alert.alert('Success', 'Order completion approved!');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to approve completion');
      }
    } catch (error: any) {
      console.error('Error approving completion:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to approve completion');
    }
    // Example:
    /*
    try {
      const response = await fetch(`/api/orders/${orderData.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Complete' }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrderData(data);
        setShowOrderComplete(true);
        setExpandedSections(prev => ({
          ...prev,
          orderCompletion: false,
          orderComplete: true
        }));
      } else {
        // Handle error
        console.error('Failed to complete order');
      }
    } catch (error) {
      console.error('Error completing order:', error);
    }
    */
  };

  const handleReviewSeller = () => {
    setShowReviewModal(true);
    
    // In a real app, you might fetch any existing review data here
    /*
    try {
      const response = await fetch(`/api/orders/${orderData.id}/review`);
      if (response.ok) {
        const data = await response.json();
        if (data.review) {
          setRating(data.review.rating);
          setReviewText(data.review.text);
        }
      }
    } catch (error) {
      console.error('Error fetching review data:', error);
    }
    */
  };

  const handleSubmitReview = async () => {
    try {
      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        Alert.alert('Error', 'Please select a rating between 1 and 5 stars');
        return;
      }

      // Validate review text
      if (!reviewText || reviewText.trim().length === 0) {
        Alert.alert('Error', 'Please write a review');
        return;
      }

      if (reviewText.length > 250) {
        Alert.alert('Error', 'Review text must be 250 characters or less');
        return;
      }

      // Submit review to API
      const response = await api.post(`/api/reviews/order/${orderId}`, {
        rating: rating,
        text: reviewText.trim(),
      });

      if (response.data.success) {
    // Update local state to show the review
    setReviewSubmitted(true);
    setShowReviewModal(false);
        setReviewDate(response.data.data?.createdAt || new Date().toISOString());
    setExpandedSections(prev => ({
      ...prev,
      orderComplete: false,  // Hide the Order Complete section
      review: true           // Show the Review section
    }));
    
    // Hide the Order Complete section entirely
    setShowOrderComplete(false);
    
        Alert.alert('Success', 'Review submitted successfully!');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to submit review');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleCancelReview = () => {
    setShowReviewModal(false);
  };

  // Add this function to toggle chat options
  const toggleChatOptions = () => {
    setShowChatOptions(!showChatOptions);
  };

  // Add this function to handle rejection
  const handleRejectCompletion = () => {
    setShowRejectModal(true);
  };

  // Add this function to submit rejection
  const handleSubmitRejection = async () => {
    try {
      // Make API call to reject completion
      const response = await api.patch(`/api/orders/${orderId}/complete`, {
        status: 'Rejected',
        rejectionReason: selectedRejectionReason === 'Other' ? customRejectionReason : selectedRejectionReason,
      });
      
      if (response.data.success) {
        // Refetch order data
        const orderResponse = await api.get(`/api/orders/buyer/${orderId}`);
        if (orderResponse.data.success) {
          setOrderDataFromApi(orderResponse.data.data);
        }
        
        setOrderStatus('Pending'); // Status will be reset to 'Pending' in backend
        setIsOrderRejected(true);
    setShowRejectModal(false);
    setExpandedSections(prev => ({
      ...prev,
      orderCompletion: true // Keep it expanded to show rejection
    }));
        Alert.alert('Success', 'Order completion rejected. Order status has been reset to Pending.');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to reject completion');
      }
    } catch (error: any) {
      console.error('Error rejecting completion:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to reject completion');
    }
    /*
    try {
      const response = await fetch(`/api/orders/${orderData.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'Rejected',
          reason: selectedRejectionReason === 'Other' ? customRejectionReason : selectedRejectionReason 
        }),
      });
      
      if (response.ok) {
        setOrderData(prev => ({
          ...prev,
          status: 'Rejected'
        }));
        setIsOrderRejected(true);
        setShowRejectModal(false);
      } else {
        // Handle error
        console.error('Failed to reject order');
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
    }
    */
  };

  // Add this function to handle the cancel order confirmation
  const handleCancelOrderConfirm = async () => {
    try {
      const cancellationReason = cancelReason === "Other" ? customCancelReason : cancelReason;
      
      if (!cancellationReason || cancellationReason.trim() === '') {
        Alert.alert('Error', 'Please provide a cancellation reason');
        return;
      }

      // Make API call to cancel order
      const response = await api.patch(`/api/orders/${orderId}/cancel`, {
        cancellationReason: cancellationReason.trim(),
      });
      
      if (response.data.success) {
        // Refetch order data
        const orderResponse = await api.get(`/api/orders/buyer/${orderId}`);
        if (orderResponse.data.success) {
          setOrderDataFromApi(orderResponse.data.data);
        }
        
        setOrderStatus('Cancelled');
    setShowCancelConfirmation(false);
    setShowCancelModal(false);
        // Reset form
        setCancelReason('');
        setCustomCancelReason('');
        setAgreeToTerms(false);
        setSelectedOptions(prev => ({ ...prev, cancelOrder: false }));
        
        Alert.alert('Success', 'Order has been cancelled successfully.');
        
        // Navigate back to orders list after a short delay
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to cancel order');
      }
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to cancel order');
    }
  };

  // Transform API data to component format
  const orderData = React.useMemo(() => {
    if (!orderDataFromApi) return null;

    const order = orderDataFromApi;
    const seller = order.sellerId;
    const job = order.jobId;
    const proposal = order.proposalId;

    const sellerName = seller 
      ? `${seller.first_name || ''} ${seller.last_name || ''}`.trim() || seller.username || 'Unknown Seller'
      : 'Unknown Seller';
    const sellerLocation = seller?.city 
      ? `${seller.city}${seller.zip_code ? `, ${seller.zip_code}` : ''}`
      : 'Location not available';
    
    let sellerImage = require('../../assets/images/profile1.png');
    if (seller?.image) {
      const imageUrl = seller.image.startsWith('http') ? seller.image : `http://192.168.29.179:5000${seller.image}`;
      sellerImage = { uri: imageUrl };
    }

    const coverLetter = proposal?.coverLetter || job?.description || 'Service description';
    const coverLetterLines = coverLetter.split('\n').filter((line: string) => line.trim());
    
    const services = getServiceNames(proposal?.categories || []);
    const genres = getGenreNames(proposal?.genres || []);
    const languages = getLanguageNames(proposal?.languages || []);

    const location = order.schedule?.location || job?.location || { name: 'TBD', address: 'TBD' };

    const attachments = (proposal?.attachments || []).map((att: any) => ({
      name: att.name || 'Attachment',
      size: formatFileSize(att.size || 0),
      type: att.type,
    }));

    // Calculate time remaining if order is Delivered
    let timeRemaining = 'N/A';
    if (order.status === 'Delivered' && order.completionRequest?.requestedAt) {
      timeRemaining = calculateTimeRemaining(order.completionRequest.requestedAt);
    }

    return {
      id: order.orderId || order._id?.toString() || 'N/A',
      status: order.status || 'Pending',
      timeRemaining,
      user: {
        name: sellerName,
        location: sellerLocation,
        image: sellerImage,
      },
      sellerOffer: {
        title: coverLetterLines[0] || 'Service offer',
        details: coverLetterLines.slice(1).map((line: string) => {
          if (line.includes('Performance Duration') || line.includes('Duration')) {
            return `Performance Duration: ${line.replace(/Performance Duration:|Duration:/gi, '').trim()}`;
          }
          return line;
        }),
        conclusion: 'Looking forward to working with you!',
        services,
        genres,
        languages,
        location: {
          name: location.name || 'TBD',
          address: location.address || 'TBD',
        },
      },
      attachments,
      schedule: {
        date: formatDate(order.schedule?.date || job?.date),
        time: formatTime(order.schedule?.time || job?.time),
        location: {
          name: location.name || 'TBD',
          address: location.address || 'TBD',
        },
      },
      createdAt: order.createdAt,
      completionRequest: order.completionRequest,
      deliveredAt: order.deliveredAt, // Include deliveredAt from API
    };
  }, [orderDataFromApi]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Header 
          title="Order Details" 
          onNotificationPress={handleNotificationPress} 
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-4">Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!orderData || !orderDataFromApi) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Header 
          title="Order Details" 
          onNotificationPress={handleNotificationPress} 
        />
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-red-500 text-center mb-2">Order not found</Text>
          <TouchableOpacity
            className="bg-red-500 rounded-lg py-3 px-6 mt-4"
            onPress={() => router.back()}
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const sellerId = orderDataFromApi.sellerId?._id?.toString() || orderDataFromApi.sellerId?.toString() || '';

  return (
    <View className="flex-1 bg-white">
      <Header 
        title="Order Details" 
        onNotificationPress={handleNotificationPress} 
      />
      
      {/* Order Filter Tabs */}
      <OrderFilterTabs
        selectedFilter={activeTab}
        onFilterChange={setActiveTab}
        filters={['Track Order', 'Chat', 'Resolution Center']}
      />
      
      {/* Track Order Tab Content */}
      {activeTab === 'Track Order' && (
        <ScrollView className="flex-1">
          <View className="p-4">
            <Text className="text-lg font-bold mb-4">Overview</Text>
            
            {/* User Info Card */}
            <View className="bg-white rounded-lg mb-4">
              <View className="flex-row items-center mb-3">
                <Image
                  source={orderData.user.image}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <View>
                  <Text className="font-medium">{orderData.user.name}</Text>
                  <Text className="text-gray-500 text-sm">{orderData.user.location}</Text>
                </View>
              </View>
              
              <View className="pt-3">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">Order Status</Text>
                  <View className={`px-2 py-1 rounded-md ${getStatusStyle(orderData.status).bgColor}`}>
                    <Text className="text-white font-medium">{orderData.status}</Text>
                  </View>
                </View>
                
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">Order ID</Text>
                  <Text className="font-medium">{orderData.id}</Text>
                </View>
                
                {orderData.status === 'Delivered' && (
                  <View className="bg-yellow-50 rounded-lg p-3 mt-2 border border-yellow-100">
                    <Text className="text-center text-gray-800">
                      Time Remaining: {orderData.timeRemaining}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            <Text className="text-lg font-bold mb-4">Timeline</Text>
            
            {/* Seller's Offer Section */}
            <TouchableOpacity 
              className="flex-row justify-between items-center mb-4"
              onPress={() => toggleSection('sellerOffer')}
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center mr-3">
                  <Assets.icons.book width={20} height={20} fill="none" />
                </View>
                <View>
                  <Text className="font-medium">Seller's Offer</Text>
                  <Text className="text-gray-500 text-xs">
                    {orderData.createdAt 
                      ? formatDate(orderData.createdAt)
                      : 'N/A'}
                  </Text>
                </View>
              </View>
              {expandedSections.sellerOffer ? (
                <Assets.icons.upArrow width={20} height={20} fill="none" />
              ) : (
                <Assets.icons.downArrow width={20} height={20} fill="none" />
              )}
            </TouchableOpacity>
            
            {expandedSections.sellerOffer && (
              <View className="mb-4">
                <Text className="text-gray-800 mb-4">
                  {orderData.sellerOffer.title}
                </Text>
                
                {orderData.sellerOffer.details.map((detail: string, index: number) => {
                  const parts = detail.split(':');
                  return (
                    <View key={index} className="mb-4">
                      <Text className="text-gray-800">
                        • <Text className="font-medium">{parts[0]}:</Text>
                        {parts[1]}
                      </Text>
                    </View>
                  );
                })}
                
                <Text className="text-gray-800 mb-4">
                  {orderData.sellerOffer.conclusion}
                </Text>
                
                <View className="mb-4">
                  <Text className="text-gray-600 mb-2">Services</Text>
                  <View className="flex-row flex-wrap">
                    {orderData.sellerOffer.services.map((service, index) => (
                      <View key={index} className="bg-gray-200 rounded-full px-4 py-1 mr-2 mb-2">
                        <Text className="text-gray-800">{service}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                <View className="mb-4">
                  <Text className="text-gray-600 mb-2">Genres</Text>
                  <View className="flex-row flex-wrap">
                    {orderData.sellerOffer.genres.map((genre, index) => (
                      <View key={index} className="bg-gray-200 rounded-full px-4 py-1 mr-2 mb-2">
                        <Text className="text-gray-800">{genre}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                <View className="mb-4">
                  <Text className="text-gray-600 mb-2">Language</Text>
                  <View className="flex-row flex-wrap">
                    {orderData.sellerOffer.languages.map((language, index) => (
                      <View key={index} className="bg-gray-200 rounded-full px-4 py-1 mr-2 mb-2">
                        <Text className="text-gray-800">{language}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                <View className="mb-4">
                  <Text className="text-gray-600 mb-2">Location</Text>
                  <View className="flex-row items-center mb-2">
                    <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
                      <Assets.icons.location width={20} height={20} fill="#EF4444" />
                    </View>
                    <View>
                      <Text className="font-medium">{orderData.sellerOffer.location.name}</Text>
                      <Text className="text-gray-500 text-sm">{orderData.sellerOffer.location.address}</Text>
                    </View>
                  </View>
                  <View className="bg-gray-200 h-40 rounded-lg mt-2 items-center justify-center">
                    <Text className="text-gray-500">Map View</Text>
                  </View>
                </View>
                
                <View className="mb-4">
                  <Text className="text-gray-600 mb-2">Attachments</Text>
                  {orderData.attachments.map((attachment: any, index: number) => (
                    <View key={index} className="bg-gray-100 rounded-lg p-3 mb-2 flex-row justify-between items-center">
                      <View className="flex-row items-center">
                        {attachment.type === 'audio' ? (
                          <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center mr-3">
                            <Assets.icons.play width={16} height={16} fill="#000000" />
                          </View>
                        ) : (
                          <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center mr-3">
                            <Image 
                              source={require('../../assets/images/profile1.png')} 
                              className="w-8 h-8 rounded-full" 
                            />
                          </View>
                        )}
                        <View>
                          <Text className="font-medium">{attachment.name}</Text>
                          <Text className="text-gray-500 text-xs">{attachment.size}</Text>
                        </View>
                      </View>
                      <TouchableOpacity>
                        <Assets.icons.download width={20} height={20} fill="none" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* Payment Section - Only show if payment exists */}
            {paymentData && (
            <TouchableOpacity 
              className="flex-row justify-between items-center mb-4"
              onPress={() => toggleSection('payment')}
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center mr-3">
                  <Assets.icons.dollar width={20} height={20} fill="none" />
                </View>
                <View>
                  <Text className="font-medium">Payment</Text>
                    <Text className="text-gray-500 text-xs">
                      {paymentData.paymentDate 
                        ? new Date(paymentData.paymentDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
                        : 'N/A'}
                    </Text>
                </View>
              </View>
              {expandedSections.payment ? (
                <Assets.icons.upArrow width={20} height={20} fill="none" />
              ) : (
                <Assets.icons.downArrow width={20} height={20} fill="none" />
              )}
            </TouchableOpacity>
            )}

            {expandedSections.payment && (
              <View className="ml-11 mb-4">
                {paymentData ? (
                  <>
                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-600">Amount Paid</Text>
                      <Text className="font-medium">${paymentData.totalAmount}</Text>
                </View>
                    <View className="flex-row justify-between mb-3">
                      <Text className="text-gray-600">Order Amount</Text>
                      <Text className="font-medium">${paymentData.amount}</Text>
                    </View>
                    {paymentData.platformCharges > 0 && (
                      <View className="flex-row justify-between mb-3">
                        <Text className="text-gray-600">Platform Charges</Text>
                        <Text className="font-medium">${paymentData.platformCharges}</Text>
                      </View>
                    )}
                    {paymentData.tax > 0 && (
                      <View className="flex-row justify-between mb-3">
                        <Text className="text-gray-600">Tax</Text>
                        <Text className="font-medium">${paymentData.tax}</Text>
                      </View>
                    )}
                    <View className="flex-row justify-between mb-3">
                      <Text className="text-gray-600">Payment Method</Text>
                      <Text className="font-medium">
                        {paymentData.paymentMethod?.type === 'card' 
                          ? `${paymentData.paymentMethod?.cardType || 'Card'} •••• ${paymentData.paymentMethod?.lastFour || ''}`
                          : paymentData.paymentMethod?.accountType === 'paypal'
                          ? `PayPal (${paymentData.paymentMethod?.email || ''})`
                          : paymentData.paymentMethod?.accountType === 'bank'
                          ? `Bank (${paymentData.paymentMethod?.bankName || ''})`
                          : 'N/A'}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-3">
                      <Text className="text-gray-600">Transaction ID</Text>
                      <Text className="font-medium text-xs">{paymentData.transactionId}</Text>
                    </View>
                    <View className="flex-row justify-between mb-3">
                      <Text className="text-gray-600">Payment Date</Text>
                      <Text className="font-medium">
                        {paymentData.paymentDate 
                          ? new Date(paymentData.paymentDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
                          : 'N/A'}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-3">
                      <Text className="text-gray-600">Status</Text>
                      <Text className="font-medium">{paymentData.status}</Text>
                    </View>
                    <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-3">
                  <Text className="text-gray-700">
                        {paymentData.status === 'Escrow' 
                          ? 'Your payment is in Escrow and will be released to the seller after successful order completion.'
                          : paymentData.status === 'Released'
                          ? 'Payment has been released to the seller.'
                          : paymentData.status === 'Refunded'
                          ? `Payment has been refunded.${paymentData.refundReason ? ` Reason: ${paymentData.refundReason}` : ''}`
                          : 'Payment status: ' + paymentData.status}
                  </Text>
                </View>
                  </>
                ) : (
                  <View className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <Text className="text-gray-600 text-center">
                      No payment information available. Please complete payment for this order.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Order Schedule Section */}
            <TouchableOpacity 
              className="flex-row justify-between items-center mb-4"
              onPress={() => toggleSection('orderSchedule')}
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center mr-3">
                  <Assets.icons.calendar width={20} height={20} fill="none" />
                </View>
                <View>
                  <Text className="font-medium">Order Schedule</Text>
                  <Text className="text-gray-500 text-xs">
                    {orderData.schedule.date}
                  </Text>
                </View>
              </View>
              {expandedSections.orderSchedule ? (
                <Assets.icons.upArrow width={20} height={20} fill="none" />
              ) : (
                <Assets.icons.downArrow width={20} height={20} fill="none" />
              )}
            </TouchableOpacity>

            {expandedSections.orderSchedule && (
              <View className="ml-11 mb-4">
                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-600">Date</Text>
                  <Text className="font-medium">{orderData.schedule.date}</Text>
                </View>
                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-600">Time</Text>
                  <Text className="font-medium">{orderData.schedule.time}</Text>
                </View>
                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-600">Location</Text>
                  <View className="items-end">
                    <Text className="font-medium text-right">{orderData.schedule.location.name}</Text>
                    <Text className="font-medium text-right">{orderData.schedule.location.address}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Dispute Section - Show if dispute exists */}
            {disputeData && (
              <>
                <TouchableOpacity 
                  className="flex-row justify-between items-center mb-4"
                  onPress={() => toggleSection('dispute')}
                >
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center mr-3">
                      <Text className="text-orange-600 font-bold text-lg">!</Text>
                    </View>
                    <View>
                      <Text className="font-medium">Dispute</Text>
                      <Text className="text-gray-500 text-xs">
                        {disputeData.createdAt 
                          ? formatDate(disputeData.createdAt)
                          : 'N/A'}
                      </Text>
                    </View>
                  </View>
                  {expandedSections.dispute ? (
                    <Assets.icons.upArrow width={20} height={20} fill="none" />
                  ) : (
                    <Assets.icons.downArrow width={20} height={20} fill="none" />
                  )}
                </TouchableOpacity>

                {expandedSections.dispute && (
                  <View className="ml-11 mb-4">
                    <View className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                      <View className="flex-row items-center mb-2">
                        <Text className="text-orange-600 font-semibold mr-2">Status:</Text>
                        <View className={`px-2 py-1 rounded-md ${
                          disputeData.status === 'Open' ? 'bg-orange-200' :
                          disputeData.status === 'In Progress' ? 'bg-blue-200' :
                          disputeData.status === 'Resolved' ? 'bg-green-200' :
                          'bg-gray-200'
                        }`}>
                          <Text className={`text-xs font-medium ${
                            disputeData.status === 'Open' ? 'text-orange-700' :
                            disputeData.status === 'In Progress' ? 'text-blue-700' :
                            disputeData.status === 'Resolved' ? 'text-green-700' :
                            'text-gray-700'
                          }`}>
                            {disputeData.status}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="mb-4">
                      <Text className="text-gray-600 mb-1">Order Number</Text>
                      <Text className="text-gray-900 font-medium">{disputeData.orderNo}</Text>
                    </View>

                    <View className="mb-4">
                      <Text className="text-gray-600 mb-1">Subject</Text>
                      <Text className="text-gray-900 font-medium">{disputeData.subject}</Text>
                    </View>

                    <View className="mb-4">
                      <Text className="text-gray-600 mb-1">Description</Text>
                      <Text className="text-gray-700 leading-5">{disputeData.description}</Text>
                    </View>

                    {disputeData.attachments && disputeData.attachments.length > 0 && (
                      <View className="mb-4">
                        <Text className="text-gray-600 mb-2">Attachments</Text>
                        {disputeData.attachments.map((attachment: any, index: number) => (
                          <View key={index} className="bg-gray-100 rounded-lg p-3 mb-2 flex-row justify-between items-center">
                            <View className="flex-row items-center flex-1">
                              <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center mr-3">
                                <Assets.icons.download width={16} height={16} fill="#000000" />
                              </View>
                              <View className="flex-1">
                                <Text className="font-medium text-gray-800" numberOfLines={1}>
                                  {attachment.name}
                                </Text>
                                <Text className="text-gray-500 text-xs">
                                  {attachment.size ? formatFileSize(attachment.size) : 'Unknown size'}
                                </Text>
                              </View>
                            </View>
                            <TouchableOpacity
                              onPress={() => {
                                // Open attachment URL
                                const fileUrl = attachment.url?.startsWith('http') 
                                  ? attachment.url 
                                  : `http://192.168.29.179:5000${attachment.url}`;
                                console.log('Opening attachment:', fileUrl);
                                // You can use Linking.openURL(fileUrl) here if needed
                              }}
                            >
                              <Assets.icons.download width={20} height={20} fill="none" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}

                    <View className="mb-4">
                      <Text className="text-gray-600 mb-1">Submitted On</Text>
                      <Text className="text-gray-900 font-medium">
                        {disputeData.createdAt 
                          ? new Date(disputeData.createdAt).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'}
                      </Text>
                    </View>

                    {disputeData.resolution && (
                      <View className="mb-4">
                        <Text className="text-gray-600 mb-1">Resolution</Text>
                        <Text className="text-gray-700">{disputeData.resolution}</Text>
                      </View>
                    )}

                    {disputeData.resolvedAt && (
                      <View className="mb-4">
                        <Text className="text-gray-600 mb-1">Resolved On</Text>
                        <Text className="text-gray-900 font-medium">
                          {new Date(disputeData.resolvedAt).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}

            {/* Order Completion Request Section */}
            {(orderData.status === 'Delivered' || orderData.status === 'Complete' || orderData.status === 'Cancelled') && (
              <>
            <TouchableOpacity 
              className="flex-row justify-between items-center mb-4"
              onPress={() => toggleSection('orderCompletion')}
            >
              <View className="flex-row items-center">
                <Image
                  source={orderData.user.image}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <View>
                  <Text className="font-medium">Order Completion Request</Text>
                      {orderData.deliveredAt && (
                        <Text className="text-gray-500 text-xs">
                          {formatDate(orderData.deliveredAt)}
                        </Text>
                      )}
                </View>
              </View>
              {expandedSections.orderCompletion ? (
                <Assets.icons.upArrow width={20} height={20} fill="none" />
              ) : (
                <Assets.icons.downArrow width={20} height={20} fill="none" />
              )}
            </TouchableOpacity>

            {expandedSections.orderCompletion && (
              <View className="ml-11 mb-4">
                    {orderData.status === 'Delivered' ? (
                      <>
                {isOrderRejected ? (
                  <>
                    <View className="bg-red-50 rounded-lg p-3 mb-4">
                      <Text className="text-red-500 font-medium mb-1">Rejected</Text>
                              {orderDataFromApi?.completionRequest?.rejectedAt && (
                                <Text className="text-gray-600 text-xs mb-2">
                                  Rejected on: {formatDate(orderDataFromApi.completionRequest.rejectedAt)}
                                </Text>
                              )}
                      <Text className="text-gray-700 mb-2">Rejection Reason:</Text>
                      <Text className="text-gray-700">
                                {orderDataFromApi?.completionRequest?.rejectionReason || 
                                 (selectedRejectionReason === 'Other' 
                          ? customRejectionReason 
                                   : selectedRejectionReason)}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      className="mt-2"
                      onPress={() => setActiveTab('Resolution Center')}
                    >
                      <Text className="text-center text-red-500 font-medium">Go to Resolution Center</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text className="text-gray-700 mb-4">
                      Seller has marked this order as complete, you can either approve the request or contact support through our resolution center.
                    </Text>
                    
                    <View className="flex-row justify-between mb-3">
                      <TouchableOpacity 
                        className="flex-1 mr-2 border border-gray-300 rounded-lg py-3"
                        onPress={handleRejectCompletion}
                      >
                        <Text className="text-gray-700 text-center font-medium">Reject</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        className="flex-1 ml-2 bg-red-500 rounded-lg py-3"
                        onPress={handleApproveCompletion}
                      >
                        <Text className="text-white text-center font-medium">Approve</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity 
                      className="mt-2"
                      onPress={() => setActiveTab('Resolution Center')}
                    >
                      <Text className="text-center text-red-500 font-medium">Go to Resolution Center</Text>
                    </TouchableOpacity>
                  </>
                        )}
                      </>
                    ) : orderData.status === 'Complete' ? (
                      <>
                        <View className="bg-green-50 rounded-lg p-3 mb-4">
                          <Text className="text-green-600 font-medium mb-1">Approved</Text>
                          {orderDataFromApi?.completionRequest?.approvedAt && (
                            <Text className="text-gray-700 text-sm">
                              Approved on: {formatDate(orderDataFromApi.completionRequest.approvedAt)}
                            </Text>
                )}
              </View>
                      </>
                    ) : orderData.status === 'Cancelled' ? (
                      <>
                        <View className="bg-red-50 rounded-lg p-3 mb-4">
                          <Text className="text-red-500 font-medium mb-1">Rejected</Text>
                          {orderDataFromApi?.completionRequest?.rejectedAt && (
                            <Text className="text-gray-600 text-xs mb-2">
                              Rejected on: {formatDate(orderDataFromApi.completionRequest.rejectedAt)}
                            </Text>
                          )}
                          <Text className="text-gray-700 mb-2">Rejection Reason:</Text>
                          <Text className="text-gray-700">
                            {orderDataFromApi?.completionRequest?.rejectionReason || 'No reason provided'}
                          </Text>
                        </View>
                        <TouchableOpacity 
                          className="mt-2"
                          onPress={() => setActiveTab('Resolution Center')}
                        >
                          <Text className="text-center text-red-500 font-medium">Go to Resolution Center</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <View className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <Text className="text-gray-600 text-center">
                            Seller is yet to complete the order. You will be notified once the order is delivered.
                          </Text>
                        </View>
                        <TouchableOpacity 
                          className="mt-2"
                          onPress={() => setActiveTab('Resolution Center')}
                        >
                          <Text className="text-center text-red-500 font-medium">Go to Resolution Center</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}
              </>
            )}
            
            {/* Order Complete Section */}
            {(showOrderComplete || orderData.status === 'Complete') && (
              <>
                <TouchableOpacity 
                  className="flex-row justify-between items-center mb-4"
                  onPress={() => toggleSection('orderComplete')}
                >
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center mr-3">
                      {/* <Assets.icons.checkmark width={20} height={20} fill="none" /> */}
                    </View>
                    <View>
                      <Text className="font-medium">Order Complete</Text>
                      <Text className="text-gray-500 text-xs">
                        {orderDataFromApi?.completionRequest?.approvedAt 
                          ? formatDate(orderDataFromApi.completionRequest.approvedAt)
                          : orderDataFromApi?.status === 'Complete' && orderDataFromApi?.updatedAt
                          ? formatDate(orderDataFromApi.updatedAt)
                          : 'N/A'}
                      </Text>
                    </View>
                  </View>
                  {expandedSections.orderComplete ? (
                    <Assets.icons.upArrow width={20} height={20} fill="none" />
                  ) : (
                    <Assets.icons.downArrow width={20} height={20} fill="none" />
                  )}
                </TouchableOpacity>

                {expandedSections.orderComplete && (
                  <View className="ml-11 mb-4">
                    <Text className="text-gray-700 mb-4">
                      Your order is now complete!
                    </Text>
                    
                    {orderDataFromApi?.completionRequest?.approvedAt && (
                      <View className="mb-4">
                        <Text className="text-gray-600 text-sm mb-1">Completed On</Text>
                        <Text className="text-gray-900 font-medium">
                          {formatDate(orderDataFromApi.completionRequest.approvedAt)}
                        </Text>
                      </View>
                    )}
                    
                    <TouchableOpacity 
                      className="border border-gray-300 rounded-lg py-3"
                      onPress={handleReviewSeller}
                    >
                      <Text className="text-gray-700 text-center font-medium">Review Seller</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {/* Review Section - Shows after review is submitted */}
            {reviewSubmitted && (
              <>
                <TouchableOpacity 
                  className="flex-row justify-between items-center mb-4"
                  onPress={() => toggleSection('review')}
                >
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center mr-3">
                      <Assets.icons.star width={20} height={20} fill="none" />
                    </View>
                    <View>
                      <Text className="font-medium">Review</Text>
                      <Text className="text-gray-500 text-xs">
                        {reviewDate ? formatDate(reviewDate) : 'N/A'}
                      </Text>
                    </View>
                  </View>
                  {expandedSections.review ? (
                    <Assets.icons.upArrow width={20} height={20} fill="none" />
                  ) : (
                    <Assets.icons.downArrow width={20} height={20} fill="none" />
                  )}
                </TouchableOpacity>

                {expandedSections.review && (
                  <View className="ml-11 mb-4">
                    <Text className="text-gray-700 mb-2">
                      How was your experience with {orderData.user.name}?
                    </Text>
                    
                    <View className="flex-row mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Text key={star} className={`text-xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                          ★
                        </Text>
                      ))}
                    </View>
                    
                    <Text className="text-gray-600 mb-2">Please share your remarks</Text>
                    <View className="border border-gray-300 rounded-lg p-3 mb-4">
                      <Text className="text-gray-700">
                        {reviewText || 'No review text available'}
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}

            {/* Review Modal */}
            {showReviewModal && (
              <View className="absolute inset-0 bg-black bg-opacity-50 justify-end z-50">
                <View className="bg-white rounded-t-xl w-full p-4">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-bold">Review Seller</Text>
                    <TouchableOpacity onPress={handleCancelReview}>
                      <Text className="text-2xl">×</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <Text className="mb-2">How was your experience with {orderData.user.name}?</Text>
                  
                  <View className="flex-row mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity 
                        key={star} 
                        onPress={() => setRating(star)}
                      >
                        <Text className={`text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                          ★
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  <Text className="mb-2">Please share your remarks</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg p-3 mb-4 h-24 text-gray-700"
                    multiline
                    placeholder="The performance was incredible—both the guitar playing and singing captivated our guests and created a fantastic atmosphere."
                    value={reviewText}
                    onChangeText={setReviewText}
                  />
                  
                  <Text className="text-gray-500 text-xs mb-4">250 words max</Text>
                  
                  <View className="flex-row justify-between">
                    <TouchableOpacity 
                      className="border border-gray-300 rounded-lg py-3 px-6"
                      onPress={handleCancelReview}
                    >
                      <Text className="text-gray-700 font-medium">Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      className="bg-red-500 rounded-lg py-3 px-6"
                      onPress={handleSubmitReview}
                    >
                      <Text className="text-white font-medium">Submit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            
            {/* Other timeline sections would go here */}
          </View>
        </ScrollView>
      )}
      
      {/* Chat Tab Content */}
      {activeTab === 'Chat' && sellerId && (
        <ChatScreen 
          receiverId={sellerId} 
          receiverName={orderData.user.name}
        />
      )}
      
      {/* Resolution Center Tab Content */}
      {activeTab === 'Resolution Center' && (
        <ScrollView className="flex-1 p-4">
          <Text className="text-lg font-bold mb-2">Resolution Center</Text>
          <Text className="text-gray-600 mb-6">
            This is where you can address & resolve any order related issues.
          </Text>
          
          {/* Option items styled as selectable with red circles */}
          <TouchableOpacity 
            className="flex-row items-center mb-4"
            onPress={() => toggleOption('requestModification')}
          >
            <View className={`w-6 h-6 rounded-full mr-3 items-center justify-center ${selectedOptions.requestModification ? 'bg-red-500' : 'border border-gray-300'}`}>
              {selectedOptions.requestModification && (
                <Text className="text-white text-xs">✓</Text>
              )}
            </View>
            <Text className="text-gray-800 font-medium">
              Request order modification
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center mb-6"
            onPress={() => toggleOption('cancelOrder')}
          >
            <View className={`w-6 h-6 rounded-full mr-3 items-center justify-center ${selectedOptions.cancelOrder ? 'bg-red-500' : 'border border-gray-300'}`}>
              {selectedOptions.cancelOrder && (
                <Text className="text-white text-xs">✓</Text>
              )}
            </View>
            <Text className="text-gray-800 font-medium">
              Cancel order
            </Text>
          </TouchableOpacity>
          
          {/* Action buttons */}
          <TouchableOpacity 
            className="bg-red-500 rounded-lg p-4 mb-3"
            onPress={handleRequestAction}
          >
            <Text className="text-white font-medium text-center">Request Action</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="border border-gray-300 rounded-lg p-4"
            onPress={handleSubmitDispute}
          >
            <Text className="text-gray-800 font-medium text-center">Submit Dispute</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
      
      {/* Modals - Make sure these are at the end of the return statement */}
      {/* Cancel Order Modal */}
      {showCancelModal && (
        <View className="absolute inset-0 bg-black bg-opacity-50 justify-end z-50">
          <View className="bg-white rounded-t-xl w-full p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Cancel Order</Text>
              <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                <Text className="text-2xl">×</Text>
              </TouchableOpacity>
            </View>
            
            <Text className="mb-1 text-gray-700">Select Reason</Text>
            <TouchableOpacity 
              className="border border-gray-300 rounded-lg p-3 mb-4 flex-row justify-between items-center"
              onPress={() => setShowReasonDropdown(!showReasonDropdown)}
            >
              <Text className="text-gray-500">{cancelReason || "Ex: Event rescheduled"}</Text>
              <Assets.icons.downArrow width={16} height={16} fill="none" />
            </TouchableOpacity>
            
            {showReasonDropdown && (
              <View className="border border-gray-300 rounded-lg mb-4 absolute top-32 left-4 right-4 bg-white z-10">
                {["Event rescheduled", "Service no longer needed", "Found a better alternative", "Seller is unresponsive", "Other"].map((reason) => (
                  <TouchableOpacity 
                    key={reason}
                    className="p-3 border-b border-gray-200"
                    onPress={() => {
                      setCancelReason(reason);
                      setShowReasonDropdown(false);
                    }}
                  >
                    <Text className="text-gray-700">{reason}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <Text className="mb-1 text-gray-700">Other</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-1 text-gray-700"
              placeholder="Write custom reason"
              value={customCancelReason}
              onChangeText={setCustomCancelReason}
            />
            <Text className="text-gray-500 text-xs mb-4">250 words max...</Text>
            
            <Text className="font-bold mb-2">Order Cancellation Terms</Text>
            <View className="mb-4">
              <View className="flex-row mb-2">
                <Text className="text-gray-700 mr-2">•</Text>
                <Text className="text-gray-700 flex-1">Week before get 100% money back</Text>
              </View>
              <View className="flex-row mb-2">
                <Text className="text-gray-700 mr-2">•</Text>
                <Text className="text-gray-700 flex-1">If less than week and more then 3 days 75% money back</Text>
              </View>
              <View className="flex-row mb-2">
                <Text className="text-gray-700 mr-2">•</Text>
                <Text className="text-gray-700 flex-1">Less than 3 days but more than 24 hours its 50% money back</Text>
              </View>
              <View className="flex-row mb-2">
                <Text className="text-gray-700 mr-2">•</Text>
                <Text className="text-gray-700 flex-1">If less than 24 hours then 25% money back</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              className="flex-row items-center mb-4"
              onPress={() => setAgreeToTerms(!agreeToTerms)}
            >
              <View className={`w-5 h-5 rounded mr-2 items-center justify-center ${agreeToTerms ? 'bg-red-500' : 'border border-gray-300'}`}>
                {agreeToTerms && (
                  <Text className="text-white text-xs">✓</Text>
                )}
              </View>
              <Text className="text-gray-700 text-sm flex-1">
                Yes, I understand and agree to Terms of Service, including the User Agreement
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`rounded-lg py-3 ${agreeToTerms ? 'bg-red-500' : 'bg-gray-400'}`}
              disabled={!agreeToTerms}
              onPress={() => {
                if (agreeToTerms) {
                  setShowCancelConfirmation(true);
                }
              }}
            >
              <Text className="text-white text-center font-medium">Cancel Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <View className="absolute inset-0 bg-black bg-opacity-50 justify-end z-50">
          <View className="bg-white rounded-t-xl w-full p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Dispute Details</Text>
              <TouchableOpacity onPress={() => setShowDisputeModal(false)}>
                <Text className="text-2xl">×</Text>
              </TouchableOpacity>
            </View>
            
            <Text className="mb-1 text-gray-700">Order No.</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-500"
              placeholder="Ex: 34892"
              value={disputeForm.orderNo}
              onChangeText={(text) => setDisputeForm(prev => ({...prev, orderNo: text}))}
            />
            
            <Text className="mb-1 text-gray-700">Subject</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-500"
              placeholder="Ex: Subject"
              value={disputeForm.subject}
              onChangeText={(text) => setDisputeForm(prev => ({...prev, subject: text}))}
            />
            
            <Text className="mb-1 text-gray-700">Description</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-1 h-24 text-gray-500"
              multiline
              placeholder="Write description"
              value={disputeForm.description}
              onChangeText={(text) => setDisputeForm(prev => ({...prev, description: text}))}
            />
            <Text className="text-gray-500 text-xs mb-4">1000 characters max...</Text>
            
            <Text className="font-bold mb-2">Attach Relevant Material</Text>
            <Text className="text-gray-700 mb-4">
              Add documents or any relevant material related to this dispute.
            </Text>
            
            <TouchableOpacity 
              className="items-center border border-dashed border-gray-300 rounded-lg py-4 mb-4"
              onPress={handlePickDisputeFiles}
            >
              <Assets.icons.download width={24} height={24} stroke="#9CA3AF" fill="none" />
              <Text className="text-gray-700 font-medium mt-2">Tap & Choose Files to upload.</Text>
              <Text className="text-gray-500 text-xs mt-1">File Supported: Audio / Video / Document</Text>
            </TouchableOpacity>
            
            {/* Display selected attachments */}
            {disputeAttachments.length > 0 && (
              <View className="mb-4">
                {disputeAttachments.map((attachment, index) => (
                  <View key={index} className="flex-row items-center justify-between bg-gray-100 rounded-lg p-3 mb-2">
                    <Text className="text-gray-700 flex-1" numberOfLines={1}>
                      {attachment.name}
                    </Text>
              <TouchableOpacity 
                      onPress={() => handleRemoveDisputeAttachment(index)}
                      className="ml-2"
              >
                      <Text className="text-red-500 font-medium">Remove</Text>
              </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
              
            <View className="flex-row justify-between">
              <TouchableOpacity 
                className="border border-gray-300 rounded-lg py-3 px-6 w-5/12"
                onPress={() => {
                  setShowDisputeModal(false);
                  // Reset form when canceling
                  setDisputeForm({ orderNo: '', subject: '', description: '' });
                  setDisputeAttachments([]);
                }}
                disabled={submittingDispute}
              >
                <Text className="text-gray-700 text-center font-medium">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className={`rounded-lg py-3 px-6 w-5/12 ${submittingDispute ? 'bg-gray-400' : 'bg-red-500'}`}
                onPress={handleSubmitDisputeForm}
                disabled={submittingDispute}
              >
                {submittingDispute ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                <Text className="text-white text-center font-medium">Send</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <View className="absolute inset-0 bg-black bg-opacity-50 justify-end z-50">
          <View className="bg-white rounded-t-xl w-full p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Rejection Reason</Text>
              <TouchableOpacity onPress={() => setShowRejectModal(false)}>
                <Text className="text-2xl">×</Text>
              </TouchableOpacity>
            </View>
            
            <Text className="mb-1 text-gray-700">Select Reason</Text>
            <TouchableOpacity 
              className="border border-gray-300 rounded-lg p-3 mb-4 flex-row justify-between items-center"
              onPress={() => setShowReasonOptions(!showReasonOptions)}
            >
              <Text className="text-gray-500">{selectedRejectionReason || "Ex: Event rescheduled"}</Text>
              <Assets.icons.downArrow width={16} height={16} fill="none" />
            </TouchableOpacity>
            
            {showReasonOptions && (
              <View className="border border-gray-300 rounded-lg mb-4 absolute top-32 left-4 right-4 bg-white z-10">
                {[
                  "The seller exhibited unprofessional behavior, impacting the overall experience.",
                  "The seller has been unresponsive to messages or requests for updates during the project.",
                  "There was a misunderstanding about the scope of the service or what was to be delivered.",
                  "The service or deliverable was not provided within the agreed timeframe.",
                  "The service or content delivered is not what was initially agreed upon or is completely different from what was ordered.",
                  "Other"
                ].map((reason) => (
                  <TouchableOpacity 
                    key={reason}
                    className="p-3 border-b border-gray-200"
                    onPress={() => {
                      setSelectedRejectionReason(reason);
                      setShowReasonOptions(false);
                    }}
                  >
                    <Text className="text-gray-700">{reason}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {selectedRejectionReason === "Other" && (
              <>
                <Text className="mb-1 text-gray-700">Other</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 mb-4 h-24 text-gray-700"
                  multiline
                  placeholder="Write custom reason"
                  value={customRejectionReason}
                  onChangeText={setCustomRejectionReason}
                />
                <Text className="text-gray-500 text-xs mb-4">250 words max</Text>
              </>
            )}
            
            <View className="flex-row justify-between">
              <TouchableOpacity 
                className="border border-gray-300 rounded-lg py-3 px-6 w-5/12"
                onPress={() => setShowRejectModal(false)}
              >
                <Text className="text-gray-700 text-center font-medium">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-red-500 rounded-lg py-3 px-6 w-5/12"
                onPress={handleSubmitRejection}
                disabled={selectedRejectionReason === "Other" && !customRejectionReason.trim()}
              >
                <Text className="text-white text-center font-medium">Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* AlertModal for cancel order confirmation */}
      <AlertModal
        visible={showCancelConfirmation}
        message="Are you sure you want to cancel this order?"
        primaryButtonText="Cancel Order"
        secondaryButtonText="Back"
        onPrimaryButtonPress={handleCancelOrderConfirm}
        onSecondaryButtonPress={() => setShowCancelConfirmation(false)}
      />
    </View>
  );
};

export default OrderDetails;
