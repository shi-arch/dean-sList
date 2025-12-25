// app/(tabs)/components/HeaderSection.tsx
// Component for the header section displaying a welcome message or user's name.

import React from 'react';
import { Text, View } from 'react-native';

const HeaderSection: React.FC = () => {
  // In a real app, you might fetch the user's name from a context or API
  const userName = "Robert"; // Hardcoded for now
  const profileCompletion = 40; // Percentage of profile completion

  return (
    <View className="mt-0 mb-4  p-4 bg-gray-100 rounded-lg">
      
      
      {/* Profile Completion Section */}
      <View className="mb-4">
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-700 font-medium">Profile Completion</Text>
          <Text className="text-gray-700 font-medium">{profileCompletion}%</Text>
        </View>
        <View className="h-2 bg-gray-200 rounded-full w-full">
          <View 
            className="h-2 bg-red-500 rounded-full" 
            style={{ width: `${profileCompletion}%` }} 
          />
        </View>
        <View className="mt-2">
          <Text className="text-gray-600 text-sm">
            • Complete general profile information +30%
          </Text>
        </View>
      </View>
    </View>
  );
};

export default HeaderSection;
