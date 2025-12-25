import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { BackHandler, Image, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Assets from '../../assets';
import "../global.css";


const UpdatePassword: React.FC = () => {
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const backAction = () => {
      router.back(); // Navigate back to the previous screen
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); // Clean up the listener on unmount
  }, []);

  const handleChange = (field: string, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdatePassword = () => {
    console.log("Updating password:", passwordData);
    // Add logic to update the password (e.g., API call)
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
          Update Password
        </Text>

        {/* Password Update Section */}
        <View className="mt-6">
          <Text className="text-2xl font-semibold mb-2">
            Setup new password
          </Text>
          <Text className="text-gray-600 text-sm mb-4">
            Create a new password for your account.
          </Text>

          {/* New Password Field */}
          <View className="mt-4">
            <Text className="text-base font-semibold text-black mb-1">
              New Password<Text className="text-red-500">*</Text>
            </Text>
            <View className="relative">
              <TextInput
                placeholder="Atleast 8 characters"
                placeholderTextColor="#9CA3AF"
                className="border border-gray-300 rounded-lg p-3 text-base pr-10"
                secureTextEntry={!showNewPassword}
                value={passwordData.newPassword}
                onChangeText={(text) => handleChange("newPassword", text)}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showNewPassword ? (
                  <Assets.icons.closeEye width={20} height={20} />
                ) : (
                  <Assets.icons.openEye width={20} height={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Field */}
          <View className="mt-4">
            <Text className="text-base font-semibold text-black mb-1">
              Confirm Password<Text className="text-red-500">*</Text>
            </Text>
            <View className="relative">
              <TextInput
                placeholder="Confirm new password"
                placeholderTextColor="#9CA3AF"
                className="border border-gray-300 rounded-lg p-3 text-base pr-10"
                secureTextEntry={!showConfirmPassword}
                value={passwordData.confirmPassword}
                onChangeText={(text) => handleChange("confirmPassword", text)}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <Assets.icons.closeEye width={20} height={20} />
                ) : (
                  <Assets.icons.openEye width={20} height={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Update Password Button */}
        <TouchableOpacity
          onPress={handleUpdatePassword}
          className="bg-red-500 rounded-full py-3 mt-6"
        >
          <Text className="text-white text-center font-semibold text-base">
            UPDATE PASSWORD
          </Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <View className="mt-6 flex-row justify-center mb-6">
          <Text className="text-gray-600 text-base">
            Password updated?{' '}
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

export default UpdatePassword;
