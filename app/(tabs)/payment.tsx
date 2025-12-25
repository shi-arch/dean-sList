import Assets from "@/assets";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import ActionButtons from "./components/buttons/action-button";
import Header from "./components/MainHeader";
import AddPaymentMethodModal from "./components/settings/add-payment-method-modal";
import api from "../../api/axiosInstance";

// 1. Add proper TypeScript interfaces
interface PaymentMethod {
  type: 'card' | 'account';
  cardType?: 'Visa' | 'MasterCard';
  lastFour?: string;
  expiry?: string;
  accountType?: 'paypal' | 'bank';
  accountHolderName?: string;
  email?: string;
  bankName?: string;
  accountNumber?: string;
}

interface OrderDetails {
  performer: string;
  location: string;
  service: string;
  duration: string;
  services: string[];
  genres: string[];
  languages: string[];
  orderAmount: number;
  platformCharges: number;
  tax: number;
  total: number;
  address: string;
  selectedLocation: string;
  selectedLocationDetails: string;
  eventDateTime: string;
  eventTime: string;
  attachments: Array<{
    name: string;
    size: string;
    url?: string;
    type?: string;
  }>;
  sellerImage?: any;
  locationCoordinates?: {
    coordinates: number[]; // [longitude, latitude]
  };
}

// Constants for mapping (same as CustomOfferCard)
const genresOptions = ['Jazz', 'Country', 'Gospel', 'Christian', 'RnB', 'Pop', 'Blues', 'Funk'];
const languageOptions = ['English', 'French', 'Spanish', 'Hindi', 'Urdu'];

// 2. Update the component with proper types
const PaymentPage: React.FC = () => {
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number>(0); // Index of selected payment method
  const [expandedDuration, setExpandedDuration] = useState(false);
  const [isAddPaymentModalVisible, setIsAddPaymentModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Track editing state for save/cancel
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  // Initial payment methods (simulating existing methods)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      type: "card",
      cardType: "Visa",
      lastFour: "9275",
      expiry: "04/27",
    },
  ]);

  // Helper functions for mapping IDs to names
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

  // Fetch order details from backend
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('Order ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('[PaymentPage] Fetching order details for orderId:', orderId);
        
        // First check if payment already exists
        try {
          const paymentCheck = await api.get(`/api/payments/check/${orderId}`);
          if (paymentCheck.data.success && paymentCheck.data.data.hasPayment) {
            console.log('[PaymentPage] Payment already exists, redirecting to order details');
            Alert.alert(
              'Payment Already Processed',
              'This order has already been paid. Redirecting to order details...',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    router.replace({
                      pathname: '/(tabs)/order_details',
                      params: { id: orderId }
                    });
                  },
                },
              ]
            );
            return;
          }
        } catch (paymentErr: any) {
          // If payment check fails, continue to fetch order details
          console.log('[PaymentPage] Payment check failed or no payment exists, continuing...');
        }
        
        const response = await api.get(`/api/orders/buyer/${orderId}`);
        
        console.log('[PaymentPage] Order details response:', response.data);

        if (response.data.success) {
          const order = response.data.data;
          const seller = order.sellerId;
          const proposal = order.proposalId;
          const job = order.jobId;
          
          // Get seller name and location
          const sellerName = seller 
            ? `${seller.first_name || ''} ${seller.last_name || ''}`.trim() || seller.username || 'Unknown Seller'
            : 'Unknown Seller';
          const sellerLocation = seller?.city 
            ? `${seller.city}${seller.zip_code ? `, ${seller.zip_code}` : ''}`
            : 'Location not available';

          // Get seller image
          let sellerImage = require('../../assets/images/profile1.png');
          if (seller?.image) {
            const imageUrl = seller.image.startsWith('http') ? seller.image : `http://192.168.29.179:5000${seller.image}`;
            sellerImage = { uri: imageUrl };
          }

          // Get cover letter/description
          const coverLetter = proposal?.coverLetter || job?.description || 'Service description';
          const coverLetterLines = coverLetter.split('\n').filter((line: string) => line.trim());
          const durationLine = coverLetterLines.find((line: string) => 
            line.includes('Performance Duration') || line.includes('Duration') || line.includes('perform for')
          );

          // Get services, genres, languages
          const services = getServiceNames(proposal?.categories || []);
          const genres = getGenreNames(proposal?.genres || []);
          const languages = getLanguageNames(proposal?.languages || []);

          // Get location
          const location = order.schedule?.location || job?.location;
          const locationName = location?.name || 'TBD';
          const locationAddress = location?.address || 'TBD';
          const locationCoordinates = location?.coordinates;

          // Get event date and time
          const eventDate = order.schedule?.date || job?.date;
          const eventTime = order.schedule?.time || job?.time;

          // Get attachments
          const attachments = (proposal?.attachments || []).map((att: any) => ({
            name: att.name || 'Attachment',
            size: formatFileSize(att.size || 0),
            url: att.url,
            type: att.type,
          }));

          // Calculate totals (you may want to adjust these based on your business logic)
          const orderAmount = order.payment?.amount || 0;
          const platformCharges = 5; // 5% platform fee
          const tax = 2; // 2% tax
          const total = orderAmount + (orderAmount * platformCharges / 100) + (orderAmount * tax / 100);

          const transformedOrder: OrderDetails = {
            performer: sellerName,
            location: sellerLocation,
            service: coverLetterLines[0] || 'Service description',
            duration: durationLine || coverLetter,
            services,
            genres,
            languages,
            orderAmount,
            platformCharges,
            tax,
            total: Math.round(total * 100) / 100, // Round to 2 decimal places
            address: locationAddress,
            selectedLocation: locationName,
            selectedLocationDetails: locationAddress,
            eventDateTime: formatDate(eventDate),
            eventTime: formatTime(eventTime),
            attachments,
            sellerImage,
            locationCoordinates,
          };

          console.log('[PaymentPage] Transformed order details:', transformedOrder);
          setOrderDetails(transformedOrder);
        } else {
          setError(response.data.message || 'Failed to fetch order details');
        }
      } catch (err: any) {
        console.error('[PaymentPage] Error fetching order details:', err);
        // Handle 401 errors specifically - don't retry
        if (err.response?.status === 401) {
          setError('Authentication required. Please sign in to view order details.');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch order details');
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if orderId is provided
    if (orderId) {
      fetchOrderDetails();
    } else {
      setError('Order ID is required');
      setLoading(false);
    }
  }, [orderId]);

  const handleNotificationPress = () => {
    console.log("Notification icon pressed");
    router.push("/(tabs)/notifications");
  };

  const handlePlayAttachment = (attachmentName: string) => {
    Alert.alert("Playing", `Now playing ${attachmentName}`);
  };

  const handleAddPaymentMethod = () => {
    setIsAddPaymentModalVisible(true);
  };

  const handleAddPayment = (newPayment: PaymentMethod) => {
    setPaymentMethods((prev) => [
      ...prev,
      newPayment,
    ]);
    setIsEditing(true);
    setIsAddPaymentModalVisible(false);
  };

  const handleRemovePaymentMethod = (index: number) => {
    setPaymentMethods((prev) => prev.filter((_, i) => i !== index));
    if (selectedPaymentMethod === index) {
      setSelectedPaymentMethod(0); // Reset selection if the removed method was selected
    } else if (selectedPaymentMethod > index) {
      setSelectedPaymentMethod((prev) => prev - 1); // Adjust index if necessary
    }
    setIsEditing(true);
  };

  const handleReadMore = () => {
    setExpandedDuration(!expandedDuration);
  };

  const [processingPayment, setProcessingPayment] = useState(false);

  const handleMakePayment = async () => {
    if (!agreedToTerms) {
      setTermsError("Please agree to the Terms of Service to continue.");
      return;
    }
    if (paymentMethods.length === 0) {
      setTermsError("Please add a payment method to continue.");
      return;
    }
    if (!orderId || !orderDetails) {
      setTermsError("Order information is missing.");
      return;
    }

    try {
      setProcessingPayment(true);
      setTermsError("");

      const selectedMethod = paymentMethods[selectedPaymentMethod];
      
      // Prepare payment data
      const paymentData = {
        orderId: orderId,
        paymentMethod: {
          type: selectedMethod.type,
          ...(selectedMethod.type === 'card' && {
            cardType: selectedMethod.cardType,
            lastFour: selectedMethod.lastFour,
            expiry: selectedMethod.expiry,
          }),
          ...(selectedMethod.type === 'account' && {
            accountType: selectedMethod.accountType,
            ...(selectedMethod.accountType === 'paypal' && {
              email: selectedMethod.email,
            }),
            ...(selectedMethod.accountType === 'bank' && {
              accountHolderName: selectedMethod.accountHolderName,
              bankName: selectedMethod.bankName,
              accountNumber: selectedMethod.accountNumber,
            }),
          }),
        },
        amount: orderDetails.orderAmount,
        platformCharges: orderDetails.platformCharges,
        tax: orderDetails.tax,
        totalAmount: orderDetails.total,
      };

      console.log('[PaymentPage] Processing payment:', paymentData);

      const response = await api.post('/api/payments/process', paymentData);

      if (response.data.success) {
        Alert.alert(
          "Payment Successful",
          "Your payment has been processed and is held in escrow. Your booking has been confirmed!",
          [
            {
              text: "OK",
              onPress: () => {
                router.push({
                  pathname: '/(tabs)/order_details',
                  params: { id: orderId }
                });
              },
            },
          ]
        );
      } else {
        Alert.alert("Payment Failed", response.data.message || "Failed to process payment");
      }
    } catch (err: any) {
      console.error('[PaymentPage] Error processing payment:', err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to process payment";
      Alert.alert("Payment Error", errorMessage);
      setTermsError(errorMessage);
    } finally {
      setProcessingPayment(false);
      setIsEditing(false);
    }
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    // Optionally reset payment methods to original state if needed
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
    console.log("Changes saved");
  };

  const renderPaymentIcon = (method: PaymentMethod): React.ReactNode => {
    if (method.type === "card") {
      if (method.cardType === "Visa") {
        return <Assets.icons.visa height={24} width={40} />;
      } else if (method.cardType === "MasterCard") {
        return (
          <View className="w-9 h-9 bg-white rounded items-center justify-center">
            <Assets.icons.mastercard height={24} width={24} />
          </View>
        );
      }
    } else if (method.type === "account") {
      if (method.accountType === "paypal") {
        return (
          <View className="w-9 h-9 bg-blue-100 rounded items-center justify-center">
            <Assets.icons.paypal height={24} width={24} />
          </View>
        );
      } else if (method.accountType === "bank") {
        return (
          <View className="w-9 h-9 bg-gray-100 rounded items-center justify-center">
            <Assets.icons.bank height={24} width={24} />
          </View>
        );
      }
    }
    return null;
  };

  useEffect(() => {
    if (agreedToTerms) {
      setTermsError("");
    }
  }, [agreedToTerms]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Header title="Payment" onNotificationPress={handleNotificationPress} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-4">Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !orderDetails) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Header title="Payment" onNotificationPress={handleNotificationPress} />
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-red-500 text-center mb-2">{error || 'Order not found'}</Text>
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View className="flex-1 bg-white">
        <Header title="Payment" onNotificationPress={handleNotificationPress} />

        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Info Message */}
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 mt-6">
            <View className="flex-row items-start">
              <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="text-white text-xs font-bold">ℹ</Text>
              </View>
              <View className="flex-1">
                <Text className="text-blue-900 font-medium text-sm">
                  Please complete payment for the Musician to start work
                </Text>
              </View>
            </View>
          </View>

          <Text className="text-lg font-semibold text-black mb-4">
            Order Details
          </Text>

          {/* Profile Section */}
          <View className="flex-row items-center mb-4">
            <Image
              source={orderDetails.sellerImage || Assets.images.profile1}
              className="w-12 h-12 rounded-full mr-3"
            />
            <View>
              <Text className="text-base font-semibold text-black">
                {orderDetails.performer}
              </Text>
              <Text className="text-sm text-gray-500">
                {orderDetails.location}
              </Text>
            </View>
          </View>

          {/* Service Description */}
          <Text className="text-base text-gray-700 mb-3">
            {orderDetails.service}
          </Text>

          {/* Duration */}
          <View className="flex-row items-start mb-4">
            <Text className="text-sm text-gray-700 mr-2">•</Text>
            <View className="flex-1">
              <Text className="text-sm text-gray-700">
                Performance Duration:{" "}
                {expandedDuration
                  ? orderDetails.duration
                  : "I will perform for..."}
              </Text>
              <TouchableOpacity onPress={handleReadMore} className="mt-1">
                <Text className="text-sm text-blue-500">
                  {expandedDuration ? "Read Less" : "Read More"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Services */}
          <View className="mb-4">
            <Text className="text-base font-medium text-black mb-2">
              Services
            </Text>
            <View className="flex-row flex-wrap">
              {orderDetails.services.map((service, index) => (
                <View
                  key={`service-${index}`}
                  className="bg-gray-100 px-3 py-1.5 rounded-full mr-2 mb-2"
                >
                  <Text className="text-sm text-gray-700">{service}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Genres */}
          <View className="mb-4">
            <Text className="text-base font-medium text-black mb-2">
              Genres
            </Text>
            <View className="flex-row flex-wrap">
              {orderDetails.genres.map((genre, index) => (
                <View
                  key={index}
                  className="bg-gray-100 px-3 py-1.5 rounded-full mr-2 mb-2"
                >
                  <Text className="text-sm text-gray-700">{genre}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Languages */}
          <View className="mb-5">
            <Text className="text-base font-medium text-black mb-2">
              Language
            </Text>
            <View className="flex-row flex-wrap">
              {orderDetails.languages.map((language, index) => (
                <View
                  key={index}
                  className="bg-gray-100 px-3 py-1.5 rounded-full mr-2 mb-2"
                >
                  <Text className="text-sm text-gray-700">{language}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Location */}
          {orderDetails.selectedLocation && orderDetails.selectedLocation !== 'TBD' && (
          <View className="mb-5">
            <Text className="text-base font-medium text-black mb-3">
              Location*
            </Text>
              <View className="flex-row items-center bg-gray-100 rounded-lg p-3 mb-3">
                <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center mr-3">
                  <Text className="text-gray-700 text-xs">📍</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-black">
                  {orderDetails.selectedLocation}
                </Text>
                <Text className="text-sm text-gray-600">
                  {orderDetails.selectedLocationDetails}
                </Text>
              </View>
            </View>
            {orderDetails.locationCoordinates && 
             orderDetails.locationCoordinates.coordinates && 
             orderDetails.locationCoordinates.coordinates.length >= 2 ? (
              <View className="h-32 w-full rounded-lg overflow-hidden border border-gray-200 mb-4">
                <MapView
                  style={{ width: '100%', height: '100%' }}
                  region={{
                    latitude: orderDetails.locationCoordinates.coordinates[1], // latitude
                    longitude: orderDetails.locationCoordinates.coordinates[0], // longitude
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: orderDetails.locationCoordinates.coordinates[1],
                      longitude: orderDetails.locationCoordinates.coordinates[0],
                    }}
                  />
                </MapView>
              </View>
            ) : (
              <View className="h-32 bg-gray-100 rounded-lg mb-4 border border-gray-200 items-center justify-center">
                <Text className="text-gray-500 text-sm">Map view not available</Text>
              </View>
            )}
          </View>
          )}

          {/* Attachments */}
          <View className="mb-5">
            <Text className="text-base font-medium text-black mb-3">
              Attachments
            </Text>
            {orderDetails.attachments.map((attachment, index) => (
              <View
                key={index}
                className="flex-row items-center bg-gray-50 rounded-lg p-3 mb-2"
              >
                <TouchableOpacity
                  className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3"
                  onPress={() => handlePlayAttachment(attachment.name)}
                >
                  <Assets.icons.play height={16} width={16} />
                </TouchableOpacity>
                <View className="flex-1">
                  <Text className="text-base text-black">
                    {attachment.name}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {attachment.size}
                  </Text>
                </View>
                <TouchableOpacity className="ml-3">
                  <Assets.icons.download height={20} width={20} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Event Details */}
          <View className="flex-row items-center bg-gray-100 p-3 rounded-lg mb-6">
            <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center mr-3">
              <Assets.icons.calendar height={20} width={20} />
            </View>
            <View>
              <Text className="text-base font-medium text-black">
                {orderDetails.eventDateTime}
              </Text>
              <Text className="text-base font-medium text-black">
                {orderDetails.eventTime}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                {orderDetails.address}
              </Text>
            </View>
          </View>

          {/* Payment Summary */}
          <Text className="text-lg font-semibold text-black mb-4">Payment</Text>
          <View className="bg-white border border-gray-200 rounded-lg p-4 mb-5">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base text-gray-700">Order Amount</Text>
              <Text className="text-base font-medium text-black">
                ${orderDetails.orderAmount}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base text-gray-700">Platform Charges</Text>
              <Text className="text-base font-medium text-black">
                {orderDetails.platformCharges}%
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base text-gray-700">Tax</Text>
              <Text className="text-base font-medium text-black">
                {orderDetails.tax}%
              </Text>
            </View>
            <View className="border-t border-gray-200 pt-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-semibold text-black">Total</Text>
                <Text className="text-lg font-semibold text-black">
                  ${orderDetails.total}
                </Text>
              </View>
            </View>
          </View>

          {/* Payment Method */}
          <Text className="text-lg font-semibold text-black mb-4">
            Select Payment Method
          </Text>
          {paymentMethods.length === 0 ? (
            <Text className="text-gray-500 text-sm mb-3">No payment methods added yet.</Text>
          ) : (
            paymentMethods.map((method, index) => (
              <TouchableOpacity
                key={`payment-${index}`}
                className={`flex-row items-center justify-between bg-white border rounded-lg p-4 mb-3 ${
                  selectedPaymentMethod === index ? "border-red-500 bg-red-50" : "border-gray-200"
                }`}
                onPress={() => setSelectedPaymentMethod(index)}
              >
                <View className="flex-1 flex-row items-center">
                  {renderPaymentIcon(method)}
                  <View className="ml-3 flex-1">
                    <Text className="text-base font-medium text-black">
                      {method.type === "card"
                        ? `•••• •••• •••• ${method.lastFour}`
                        : method.accountHolderName}
                    </Text>
                    {method.type === "card" && (
                      <Text className="text-sm text-gray-600 mt-1">Exp. date {method.expiry}</Text>
                    )}
                    {method.type === "account" && method.accountType === "paypal" && (
                      <Text className="text-sm text-gray-600 mt-1">{method.email}</Text>
                    )}
                    {method.type === "account" && method.accountType === "bank" && (
                      <Text className="text-sm text-gray-600 mt-1">{method.bankName} - ••••••••{method.accountNumber?.slice(-4) || '****'}</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemovePaymentMethod(index)}
                  className="p-2"
                >
                  <Assets.icons.delete width={18} height={18} stroke="#666666" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity
            className="bg-black rounded-lg py-3.5 items-center mb-6"
            onPress={handleAddPaymentMethod}
          >
            <Text className="text-white font-medium text-base">
              Add Payment Method
            </Text>
          </TouchableOpacity>

          {/* Terms Agreement */}
          <View className="flex-row items-start mb-5">
            <TouchableOpacity
              className={`w-5 h-5 rounded mr-3 mt-0.5 items-center justify-center ${
                agreedToTerms ? "bg-red-500" : "border-2 border-gray-300"
              }`}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              {agreedToTerms && (
                <Assets.icons.checkmark
                  height={12}
                  width={12}
                  fill="#ff0000"
                  stroke="#ff0000"
                />
              )}
            </TouchableOpacity>
            <Text className="flex-1 text-sm text-gray-600">
              Yes, I understand and agree to{" "}
              <Text className="text-black">Terms of Service</Text>, including
              the <Text className="text-black">User Agreement</Text>
            </Text>
          </View>

          {termsError ? (
            <Text className="text-red-500 text-sm mb-3">{termsError}</Text>
          ) : null}

          {/* Make Payment Button */}
          <TouchableOpacity
            className={`rounded-lg py-4 items-center mb-4 ${
              agreedToTerms && !processingPayment
                ? 'bg-red-500'
                : 'bg-gray-300'
            }`}
            onPress={handleMakePayment}
            disabled={!agreedToTerms || processingPayment}
            accessibilityRole="button"
            accessibilityLabel="Make Payment"
          >
            {processingPayment ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className={`font-semibold text-base ${
                agreedToTerms && !processingPayment
                  ? 'text-white'
                  : 'text-gray-500'
              }`}>
                Make Payment
              </Text>
            )}
          </TouchableOpacity>

          {/* Action Buttons - Show when editing */}
          {isEditing && (
            <View className="mb-8">
              <ActionButtons
                onCancel={handleCancelEditing}
                onPrimaryAction={handleSaveChanges}
                cancelText="Cancel"
                primaryText="Save Changes"
                containerStyle="flex-row space-x-2 min-h-[44px]"
                cancelButtonStyle="border border-gray-300 rounded-lg py-3 px-4 flex-1 items-center justify-center min-w-[120px]"
                primaryButtonStyle="bg-red-500 rounded-lg py-3 px-4 flex-1 items-center justify-center min-w-[120px]"
                cancelTextStyle="text-gray-700 font-medium text-sm whitespace-nowrap"
                primaryTextStyle="text-white font-medium text-sm whitespace-nowrap"
              />
            </View>
          )}
        </ScrollView>
      </View>

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        visible={isAddPaymentModalVisible}
        onClose={() => setIsAddPaymentModalVisible(false)}
        onAddPayment={handleAddPayment}
      />
    </SafeAreaView>
  );
};

export default PaymentPage;