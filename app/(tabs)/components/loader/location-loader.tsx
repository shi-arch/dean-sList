import React from 'react';
import { Text, View, ActivityIndicator } from 'react-native';

interface LocationLoaderProps {
  message?: string;
  subMessage?: string;
}

const LocationLoader: React.FC<LocationLoaderProps> = ({
  message = "Fetching Location",
  subMessage = "Please wait while we get your current location..."
}) => {
  return (
    <View className="items-center justify-center py-8">
      <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
      <Text className="text-base font-medium text-gray-800 mb-1">{String(message)}</Text>
      <Text className="text-sm text-gray-500 text-center">{String(subMessage)}</Text>
    </View>
  );
};

export default LocationLoader;