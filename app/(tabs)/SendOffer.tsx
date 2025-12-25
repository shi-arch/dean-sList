import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from './components/MainHeader';
// import JobPostForm from './components/NewJobPost';

const SendOffer: React.FC = () => {
  const handleNotificationPress = () => {
    router.push('/(tabs)/notifications');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header 
        title="Send Offer" 
        showNotification={true}
        onNotificationPress={handleNotificationPress}
      />
      {/* <JobPostForm /> */}
    </SafeAreaView>
  );
};

export default SendOffer;