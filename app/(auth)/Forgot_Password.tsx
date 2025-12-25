import Assets from '@/assets';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { BackHandler, Image, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import "../global.css";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const backAction = () => {
      router.back(); // Navigate back to the previous screen
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); // Clean up the listener on unmount
  }, []);

  const handleSendLink = () => {
    console.log("Send Link pressed", { email });
    // Add logic to send the password reset link (e.g., API call)
    router.push('/(auth)/Reset_Password'); // Navigate to Reset_Password screen
  };

  const handleCancel = () => {
    router.back(); // Navigate back to the previous screen
  };

  const handleBack = () => {
    router.back(); // Go back to the previous screen
  };

  const handleSignInLink = () => {
    router.push('/(auth)/Signin'); // Navigate to Signin screen
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity onPress={handleBack} className="mt-2">
          <Text className="text-red-500 text-base font-semibold">Back</Text>
        </TouchableOpacity>

        {/* Logo */}
        <View className="items-center mt-6">
          <Image
            source={Assets.images.logo}
            className="w-32 h-16"
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold text-center mt-6">
          Forgot Password
        </Text>

        {/* Password Reset Section */}
        <View className="mt-6">
          <Text className="text-2xl font-semibold mb-2">
            Update your password
          </Text>
          <Text className="text-gray-600 text-sm mb-4">
            Enter details to sign in your email or phone number to receive a password reset link
          </Text>

          {/* Email or Phone Field */}
          <View className="mt-4">
            <Text className="text-base font-semibold text-black mb-1">
              Email or Phone<Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              placeholder="myemail@mail.com"
              placeholderTextColor="#9CA3AF"
              className="border border-gray-300 rounded-lg p-3 text-base"
              value={email}
              onChangeText={(text) => setEmail(text)}
            />
          </View>
        </View>

        {/* Bottom Action Buttons */}
        <View className="flex-row space-x-4 mt-6">
          <TouchableOpacity
            onPress={handleCancel}
            className="flex-1 border border-gray-300 rounded-full py-3"
          >
            <Text className="text-black text-center font-semibold text-base">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSendLink}
            className="flex-1 bg-red-500 rounded-full py-3"
          >
            <Text className="text-white text-center font-semibold text-base">
              Send Link
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Link */}
        <View className="mt-6 flex-row justify-center mb-6">
          <Text className="text-gray-600 text-base">
            Remembered your password?{' '}
          </Text>
          <TouchableOpacity onPress={handleSignInLink}>
            <Text className="text-red-500 text-base font-semibold">Back to Sign in</Text>
          </TouchableOpacity>
        </View>

        {/* Home Indicator Line */}
        <View className="flex-row justify-center mt-6">
          <View className="w-32 h-1 bg-gray-300 rounded-full" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPassword;