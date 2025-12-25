import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface CategoriesSectionProps {
  categories: string[];
  onCategoryPress?: (category: string) => void;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ categories, onCategoryPress }) => {
  return (
    <View className="mb-4 mt-5">
      <View className="flex-row items-center">
        <Text className="text-gray-600 mr-2">Try:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              className="bg-gray-100 rounded-full px-4 py-1 mr-2"
              onPress={() => onCategoryPress?.(category)}
            >
              <Text className="text-gray-800">{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default CategoriesSection;