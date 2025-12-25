// app/(tabs)/components/HeaderSection.tsx
// Component for the header section displaying a welcome message or user's name.

import { router } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Assets from '../../../assets';

const HeaderSection: React.FC = () => {
  // In a real app, you might fetch the user's name from a context or API
  const userName = "Robert"; // Hardcoded for now
  
  const handleNotificationPress = () => {
    console.log('Notification icon pressed');
    // Navigate to the notifications page
    router.push('/(tabs)/notifications');
  };

  const handleProfilePress = () => {
    console.log('Profile image pressed');
    // Navigate to the settings page
    router.push('/(tabs)/settings');
  };

  return (
    <View className="p-4 pb-1 mt-2 mb-0">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleProfilePress}>
            <Image
              source={Assets.images.profile1}
              className="w-10 h-10 rounded-full mr-3"
              resizeMode="cover"
            />
          </TouchableOpacity>
          <View>
            <Text className="text-base font-bold text-black">
              Welcome {userName}!
            </Text>
            <Text className="text-gray-600 text-sm">
              Let's find a perfect artist!
            </Text>
          </View>
        </View>
        <View className='bg-gray-100 rounded-full p-2'>
          <TouchableOpacity onPress={handleNotificationPress}>
            <Assets.icons.notification
              width={24} 
              height={24} 
              stroke="#000000"
              strokeWidth="1.5"
              fill="none"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HeaderSection;
