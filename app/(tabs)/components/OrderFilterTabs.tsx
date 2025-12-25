import React from 'react';
import { Text, TouchableOpacity, View, ScrollView } from 'react-native';

interface OrderFilterTabsProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  filters?: string[];
  underlineStyle?: boolean;
  pillStyle?: boolean;
  containerStyle?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
  activeBackgroundColor?: string;
  activeBorderColor?: string;
  inactiveBackgroundColor?: string; // Add this new prop
}

const OrderFilterTabs: React.FC<OrderFilterTabsProps> = ({ 
  selectedFilter, 
  onFilterChange, 
  filters = ['Active', 'Complete', 'Canceled', 'Disputes'],
  underlineStyle = true,
  pillStyle = false,
  containerStyle = "border-b border-gray-200",
  activeTextColor = "text-red-500",
  inactiveTextColor = "text-gray-500",
  activeBackgroundColor = "",
  activeBorderColor = "border-red-500",
  inactiveBackgroundColor = "" // Default to empty string
}) => {
  return (
    <View className={containerStyle}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
        className="border-b-2 border-gray-100"
      >
        <View className="flex-row">
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => onFilterChange(filter)}
              className={`items-center py-3 ${
                pillStyle ? 'px-4 rounded-full mx-1' : 'px-4'
              } ${
                pillStyle && selectedFilter === filter ? `${activeBackgroundColor}` : ''
              } ${
                pillStyle && selectedFilter !== filter ? `${inactiveBackgroundColor}` : 'bg-transparent'
              } ${
                pillStyle && selectedFilter !== filter ? 'border border-gray-300' : ''
              }`}
            >
              <Text
                className={`text-base ${
                  selectedFilter === filter ? activeTextColor : inactiveTextColor
                }`}
              >
                {filter}
              </Text>

              {underlineStyle && selectedFilter === filter && (
                <View
                  className={`h-0.5 w-20 mt-12 absolute ${
                    activeBorderColor.includes('border-')
                      ? 'bg-' + activeBorderColor.split('border-')[1]
                      : activeBorderColor
                  }`}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderFilterTabs;
