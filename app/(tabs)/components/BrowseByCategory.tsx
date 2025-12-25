import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import api from "../../../api/axiosInstance";


interface BrowseByCategoryProps {
  onCategorySelect: (category: string) => void;
}

const BrowseByCategory: React.FC<BrowseByCategoryProps> = ({ onCategorySelect }) => {
  const [instrumentCategories, setInstrumentCategories] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch subcategories from API
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        // const response = await fetch('http://192.168.29.179:5000/api/sellers/categories/subcategories');
        const response = await api.get('api/sellers/categories/subcategories');

        console.log("===================",response)
        if (response.data.success) {
          // Take up to 15 subcategories and group into rows of 3
          const limitedData = response.data.data.slice(0, 15);
          const groupedCategories: string[][] = [];
          for (let i = 0; i < limitedData.length; i += 3) {
            groupedCategories.push(limitedData.slice(i, i + 3).map((item: any) => item.name));
          }
          setInstrumentCategories(groupedCategories);
        } else {
          console.error('API error:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, []);

  // Popular categories
  const popularCategories = [
    'Singer',
    'Vocalist',
    'Guitarist',
    'Pianist',
    'Pop',
    'Hip Hop',
    'Rock',
  ];

  return (
    <View className="mb-6">
      <Text className="text-lg font-bold text-black mb-4">Browse by Category</Text>

      {/* Instrument Categories */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : instrumentCategories.length > 0 ? (
        instrumentCategories.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} className="flex-row mb-2">
            {row.map((category, index) => (
              <TouchableOpacity
                key={`${rowIndex}-${index}`}
                className="bg-gray-100 rounded-full px-4 py-2 mr-2"
                onPress={() => onCategorySelect(category.toLowerCase().replace(/\s+/g, '-'))}
              >
                <Text className="text-gray-800">{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))
      ) : (
        <Text className="text-gray-800">No categories available</Text>
      )}

      {/* Popular Categories */}
      <Text className="text-lg font-bold text-black mt-6 mb-0">Popular Categories</Text>
      <View>
        {popularCategories.map((category, index) => (
          <TouchableOpacity
            key={index}
            className="py-2"
            onPress={() => onCategorySelect(category.toLowerCase().replace(/\s+/g, '-'))}
          >
            <Text className="text-gray-800 text-base">{category}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default BrowseByCategory;