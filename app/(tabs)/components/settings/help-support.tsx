import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Assets from '../../../../assets';
import Header from '../MainHeader';

const HelpSupport: React.FC = () => {
  const handleBack = () => {
    router.back();
  };

  const handleNotificationPress = () => {
    router.push('/(tabs)/notifications');
  };

  // State for FAQ collapsible items
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // FAQ data (matching the design exactly)
  const faqs = [
    {
      question: 'How do I book a musician for my event?',
      answer: 'To book a musician, browse the talent section, select a musician, and click "Hire Talent". Follow the prompts to confirm your booking.',
    },
    {
      question: 'Can I communicate with the musician before booking?',
      answer: 'Yes, you can send a message to the musician via the "Send Message" button on their profile to discuss details before booking.',
    },
    {
      question: 'How are payments handled?',
      answer: 'Payments are securely processed through our platform. You’ll be prompted to enter your payment details during the booking process.',
    },
    {
      question: 'What if the musician I want is not available on my event date?',
      answer: 'You can check the musician’s availability on their profile. If they’re unavailable, you can browse other talents or contact support for assistance.',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title="Help & Support"
        showNotification={true}
        onBackPress={handleBack}
        onNotificationPress={handleNotificationPress}
      />
      <ScrollView className="flex-1 px-4">
        {/* Contact Us Section */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-black mt-4 mb-2">Contact Us</Text>
          <Text className="text-sm text-gray-500 mb-4">Facing issues? We're here to help.</Text>

          {/* Customer Service */}
          <View className="bg-gray-100 rounded-lg p-4 mb-4">
            <View className="flex-row items-center ">
              <TouchableOpacity className='bg-white p-4 rounded-full'>
                <Assets.icons.phone width={24} height={24} stroke="#000" />
              </TouchableOpacity>
            <View className='ml-5'>
              <Text className="text-sm text-gray-500 mb-2">Our 24/7 Customer Service</Text>

              <Text className="text-base font-medium  text-black/50">+123 456 7890</Text>
            </View>
              
            </View>
          </View>

          {/* Write Us At */}
          <View className="bg-gray-100 rounded-lg p-4">
            <View className="flex-row items-center ">
              <TouchableOpacity className='bg-white p-4 rounded-full'>
                <Assets.icons.email width={24} height={24} stroke="#000" />
              </TouchableOpacity>
            <View className='ml-5'>
              <Text className="text-sm text-gray-500 mb-2">Write Us at</Text>

              <Text className="text-base font-medium  text-black/50">admin@rmail.com</Text>
            </View>
              
            </View>
          </View>
        </View>

        {/* FAQ Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-black/50 mb-3">Frequently Asked Questions</Text>
          {faqs.map((faq, index) => (
            <View key={index} className="border-b border-gray-200">
              <TouchableOpacity
                className="flex-row items-center justify-between py-4"
                onPress={() => toggleExpand(index)}
              >
                <Text className="text-base text-gray-800 flex-1 pr-4">{faq.question}</Text>
                <Assets.icons.downArrow
                  width={16}
                  height={16}
                  stroke="#9CA3AF"
                  style={{
                    transform: [{ rotate: expandedIndex === index ? '180deg' : '0deg' }],
                  }}
                />
              </TouchableOpacity>
              {expandedIndex === index && (
                <Text className="text-sm text-gray-600 mb-4" style={{ lineHeight: 20 }}>
                  {faq.answer}
                </Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

    </SafeAreaView>
  );
};

export default HelpSupport;