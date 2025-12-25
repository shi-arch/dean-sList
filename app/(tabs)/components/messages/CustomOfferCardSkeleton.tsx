import React from 'react';
import { View, Text } from 'react-native';

const CustomOfferCardSkeleton: React.FC = () => {
  return (
    <View className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      {/* Header Skeleton */}
      <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-gray-200">
        <View className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        <View className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
      </View>
      
      {/* Description Skeleton */}
      <View className="mb-3">
        <View className="h-4 w-full bg-gray-200 rounded mb-2 animate-pulse" />
        <View className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
      </View>

      {/* Services Skeleton */}
      <View className="mb-3">
        <View className="h-3 w-16 bg-gray-200 rounded mb-2 animate-pulse" />
        <View className="flex-row flex-wrap">
          <View className="h-6 w-20 bg-gray-200 rounded-full mr-2 mb-2 animate-pulse" />
          <View className="h-6 w-24 bg-gray-200 rounded-full mr-2 mb-2 animate-pulse" />
          <View className="h-6 w-16 bg-gray-200 rounded-full mr-2 mb-2 animate-pulse" />
        </View>
      </View>

      {/* Location Skeleton */}
      <View className="mb-3">
        <View className="h-3 w-20 bg-gray-200 rounded mb-2 animate-pulse" />
        <View className="flex-row items-start mb-2">
          <View className="w-8 h-8 rounded-full bg-gray-200 mr-2 animate-pulse" />
          <View className="flex-1">
            <View className="h-4 w-32 bg-gray-200 rounded mb-1 animate-pulse" />
            <View className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
          </View>
        </View>
        <View className="h-32 w-full bg-gray-200 rounded-lg animate-pulse" />
      </View>

      {/* Event Details Skeleton */}
      <View className="bg-gray-100 rounded-lg p-4 mt-3">
        <View className="h-4 w-40 bg-gray-200 rounded mb-2 animate-pulse" />
        <View className="h-4 w-32 bg-gray-200 rounded mb-2 animate-pulse" />
        <View className="h-4 w-28 bg-gray-200 rounded mb-3 animate-pulse" />
        <View className="flex-row mt-3 pt-3 border-t border-gray-300">
          <View className="flex-1 h-10 bg-gray-200 rounded-lg mr-2 animate-pulse" />
          <View className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse" />
        </View>
      </View>
    </View>
  );
};

export default CustomOfferCardSkeleton;

