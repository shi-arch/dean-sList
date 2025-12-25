// app/(auth)/UserDetailsForm.tsx
// This file implements the User Details Form page for a mobile app built with React Native and Expo.
// It includes form validation for username, city, and zip code, and prevents submission until the form is valid.

import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { BackHandler, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import "../global.css";


const UserDetailsForm: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    city: "",
    zipCode: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    city: "",
    zipCode: "",
  });

  const [touchedFields, setTouchedFields] = useState({
    username: false,
    city: false,
    zipCode: false,
  });

  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  // Validation functions
  const validateUsername = (value: string) => {
    if (!value) return 'Username is required';
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
    return '';
  };

  const validateCity = (value: string) => {
    if (!value) return 'City is required';
    if (value.length < 2) return 'City must be at least 2 characters';
    return '';
  };

  const validateZipCode = (value: string) => {
    if (!value) return 'Zip Code is required';
    const zipRegex = /^\d{5,6}$/;
    if (!zipRegex.test(value)) return 'Zip Code must be 5 or 6 digits';
    return '';
  };

  // Handle when a field is focused/blurred
  const handleFieldTouch = (field: string) => {
    setTouchedFields({
      ...touchedFields,
      [field]: true,
    });
  };

  // Handle input changes and validate in real-time
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (!touchedFields[field as keyof typeof touchedFields]) {
      handleFieldTouch(field);
    }

    let error = '';
    switch (field) {
      case 'username':
        error = validateUsername(value);
        break;
      case 'city':
        error = validateCity(value);
        break;
      case 'zipCode':
        error = validateZipCode(value);
        break;
    }
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
    validateForm();
  };

  // Validate the entire form to enable/disable the submit button
  const validateForm = () => {
    const newErrors = {
      username: validateUsername(formData.username),
      city: validateCity(formData.city),
      zipCode: validateZipCode(formData.zipCode),
    };

    setErrors(newErrors);

    const valid = !Object.values(newErrors).some((error) => error !== '');
    setIsFormValid(valid);

    return newErrors;
  };

  // Helper function to determine if we should show an error for a field
  const shouldShowError = (field: string) => {
    return (
      (submissionAttempted || touchedFields[field as keyof typeof touchedFields]) &&
      errors[field as keyof typeof errors] !== ''
    );
  };

  const handleContinue = () => {
    setSubmissionAttempted(true);

    const allTouched = Object.keys(touchedFields).reduce((acc, field) => {
      return { ...acc, [field]: true };
    }, {});
    setTouchedFields(allTouched as typeof touchedFields);

    const validationErrors = validateForm();

    const hasErrors = Object.values(validationErrors).some((error) => error !== '');

    if (hasErrors) {
      return;
    }

    console.log("Form submitted:", formData);
    // Add logic to proceed (e.g., navigate to the next screen)
    // Use replace instead of dismissAll to avoid POP_TO_TOP warning
    router.replace('/(tabs)/home');
  };

  const handleBack = () => {
    router.back();
  };

  const handleSignInLink = () => {
    router.push('/(auth)/Signin');
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View className="flex-1">
        {/* Back Button */}
        <TouchableOpacity onPress={handleBack} className="mt-2 ml-5">
          <Text className="text-red-500 text-base font-semibold mt-6">Back</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text className="text-3xl font-bold text-center mt-6 px-5">
          Provide a few more details{'\n'}to continue
        </Text>

        {/* Form */}
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-6">
            {/* Username Field */}
            <View className="mt-4">
              <Text className="text-base font-semibold text-black mb-1">
                Username
              </Text>
              <TextInput
                placeholder="Ex: Fox_Robert"
                placeholderTextColor="#9CA3AF"
                className={`border ${
                  shouldShowError('username') ? 'border-red-500' : 'border-gray-300'
                } rounded-lg p-3 text-base`}
                value={formData.username}
                onChangeText={(text) => handleChange("username", text)}
                onBlur={() => handleFieldTouch('username')}
              />
              {shouldShowError('username') ? (
                <Text className="text-red-500 text-sm mt-1">{errors.username}</Text>
              ) : null}
            </View>

            {/* City Field */}
            <View className="mt-4">
              <Text className="text-base font-semibold text-black mb-1">
                City<Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="Ex: New York"
                placeholderTextColor="#9CA3AF"
                className={`border ${
                  shouldShowError('city') ? 'border-red-500' : 'border-gray-300'
                } rounded-lg p-3 text-base`}
                value={formData.city}
                onChangeText={(text) => handleChange("city", text)}
                onBlur={() => handleFieldTouch('city')}
              />
              {shouldShowError('city') ? (
                <Text className="text-red-500 text-sm mt-1">{errors.city}</Text>
              ) : null}
            </View>

            {/* Zip Code Field */}
            <View className="mt-4">
              <Text className="text-base font-semibold text-black mb-1">
                Zip Code<Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="Ex: 475629"
                placeholderTextColor="#9CA3AF"
                className={`border ${
                  shouldShowError('zipCode') ? 'border-red-500' : 'border-gray-300'
                } rounded-lg p-3 text-base`}
                value={formData.zipCode}
                onChangeText={(text) => handleChange("zipCode", text)}
                onBlur={() => handleFieldTouch('zipCode')}
                keyboardType="numeric"
              />
              {shouldShowError('zipCode') ? (
                <Text className="text-red-500 text-sm mt-1">{errors.zipCode}</Text>
              ) : null}
            </View>
          </View>
        </ScrollView>

        {/* Continue Button - Fixed at bottom */}
        <View className="px-5 mb-6">
          <TouchableOpacity
            onPress={handleContinue}
            className={`rounded-full py-3 mt-4 ${isFormValid ? 'bg-red-500' : 'bg-gray-400'}`}
            disabled={!isFormValid}
          >
            <Text className="text-white text-center font-semibold text-base">
              CONTINUE
            </Text>
          </TouchableOpacity>

          {/* Home Indicator Line */}
          <View className="flex-row justify-center mt-6">
            <View className="w-32 h-1 bg-gray-300 rounded-full" />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default UserDetailsForm;