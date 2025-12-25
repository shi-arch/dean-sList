import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface PaginationDotsProps {
  totalPages: number;
  currentPage: number;
  onDotPress?: (index: number) => void;
}

const PaginationDots: React.FC<PaginationDotsProps> = ({ totalPages, currentPage, onDotPress }) => {
  return (
    <View className="flex-row justify-center items-center space-x-2">
      {Array.from({ length: totalPages }).map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onDotPress?.(index)}
          className={`h-3 w-9 mr-1 rounded-full ${
            currentPage === index ? 'bg-red-500 w-4' : 'bg-gray-300'
          }`}
        />
      ))}
    </View>
  );
};

export default PaginationDots;