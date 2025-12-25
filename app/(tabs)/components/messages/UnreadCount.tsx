import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// Component for unread message count
const UnreadCount: React.FC<{ count: number; onClear: () => void }> = ({ count, onClear }) => {
  if (count === 0) return null;

  return (
    <View className="absolute top-2 right-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
      <Text className="text-white text-xs">{count}</Text>
      <TouchableOpacity onPress={onClear} className="absolute w-full h-full" />
    </View>
  );
};

export default UnreadCount;