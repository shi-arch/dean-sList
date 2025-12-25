
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import Header from './components/MainHeader';
import OrdersContent from './components/OrdersContent';

const Orders: React.FC = () => {
  const handleNotificationPress = () => {
    console.log('Notification icon pressed');
    // Navigate to the notifications page
    router.push('/(tabs)/notifications');
  };

  return (
    <View className="flex-1 bg-white">
      <Header 
        title="Orders" 
        onNotificationPress={handleNotificationPress} 
      />
      <OrdersContent />
    </View>
  );
};

export default Orders;

