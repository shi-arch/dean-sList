import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Assets from '../../../../assets';
import "../../../global.css";
import Header from '../MainHeader';

const ExpenseManagement: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('This Month');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Mock invoice data with updated dates (today is June 02, 2025)
  const invoices = [
    {
      id: 1,
      name: 'Robert Fox',
      date: '02/06/25', // Today, DD/MM/YY format
      description: 'Pop Singer & Guitarist Required for Birthday Party',
      amount: 200.00,
      otherExpense: 100.00,
    },
    {
      id: 2,
      name: 'Robert Fox',
      date: '01/06/25', // Yesterday, DD/MM/YY format
      description: 'Pop Singer & Guitarist Required for Birthday Party',
      amount: 200.00,
      otherExpense: 100.00,
    },
  ];

  // Calculate totals
  const totalSpent = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalOrders = invoices.length * 5; // Mock calculation

  const handleBack = () => {
    router.back();
  };

  const handleNotificationPress = () => {
    router.push('/(tabs)/notifications');
  };

  const toggleFilterDropdown = () => {
    setShowFilterDropdown(!showFilterDropdown);
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setShowFilterDropdown(false);
    console.log('Selected Filter:', filter);
  };

  const handleGenerateReport = () => {
    console.log('Generate Report pressed');
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <Header
        title="Expense Management"
        showNotification={true}
        onBackPress={handleBack}
        onNotificationPress={handleNotificationPress}
      />
      
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Total Spent Section */}
        <View className="px-5 py-4 bg-gray-50 m-4 rounded-lg">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base font-medium text-gray-600">
              Total Spent
            </Text>
            <View className="relative bg-white p-1">
              <TouchableOpacity
                onPress={toggleFilterDropdown}
                className="flex-row items-center"
              >
                <Text className="text-sm font-medium text-gray-600 mr-1">
                  {selectedFilter}
                </Text>
                <Assets.icons.downArrow width={12} height={12} />
              </TouchableOpacity>

              {showFilterDropdown && (
                <View className="absolute top-6 right-0 bg-white  border border-gray-300 rounded-lg shadow-lg z-10 min-w-[120px]">
                  <TouchableOpacity
                    onPress={() => handleFilterSelect('This Month')}
                    className="py-2 px-3 border-b border-gray-200"
                  >
                    <Text className="text-sm font-medium text-black">This Month</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleFilterSelect('Last Month')}
                    className="py-2 px-3 border-b border-gray-200"
                  >
                    <Text className="text-sm font-medium text-black">Last Month</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleFilterSelect('This Year')}
                    className="py-2 px-3"
                  >
                    <Text className="text-sm font-medium text-black">This Year</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          
          <Text className="text-3xl font-bold text-red-500 mb-4">
            ${totalSpent.toFixed(2)}
          </Text>

          {/* Total Orders */}
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-medium text-gray-600">
              Total Orders
            </Text>
            <Text className="text-lg font-semibold text-black">
              {totalOrders}
            </Text>
          </View>
        </View>

        {/* Invoices Section */}
        <View className="px-5">
          <Text className="text-lg font-semibold text-black mb-4">
            Invoices
          </Text>

          {invoices.map((invoice, index) => (
            <View key={invoice.id} className="mb-4 border border-gray-100">
              <View className="bg-white rounded-xl p-4 ">
                <View className="flex-row items-center mb-3">
                  <View className="w-12 h-12 rounded-full mr-3 overflow-hidden">
                    <Image
                      source={Assets.images.profile1}
                      className="w-full h-full"
                      resizeMode="cover"
                      onError={() => (
                        <View className="w-full h-full bg-white rounded-full flex items-center justify-center">
                          <Text className="text-white font-bold text-base">
                            {invoice.name.split(' ').map(n => n[0]).join('')}
                          </Text>
                        </View>
                      )}
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1 mr-2">
                        <Text className="text-base font-semibold text-black">
                          {invoice.name}
                        </Text>
                        <Text className="text-xs font-medium text-gray-500 mt-1">
                          {invoice.date}
                        </Text>
                      </View>
                      <Text className="text-xl font-bold text-black">
                        ${invoice.amount.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <Text className="text-sm font-medium text-gray-700 mb-4 leading-5">
                  {invoice.description}
                </Text>
                
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm font-medium text-gray-600">
                    Other Expense
                  </Text>
                  <Text className="text-base font-semibold text-black">
                    ${invoice.otherExpense.toFixed(2)}
                  </Text>
                </View>
              </View>
              
              {/* Edit Section */}
              <View className="border-t border-gray-100 pt-3 m-3">
                <TouchableOpacity className="flex-row items-center ml-4">
                  <Text className="text-sm font-medium text-gray-600 mr-1">
                    Edit
                  </Text>
                  <Assets.icons.edit width={16} height={16} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Generate Report Button */}
      <View className="px-5 pb-6">
        <TouchableOpacity
          onPress={handleGenerateReport}
          className="bg-red-500 rounded-xl py-4 items-center shadow-sm"
        >
          <Text className="text-white text-base font-semibold">
            Generate Report
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ExpenseManagement;