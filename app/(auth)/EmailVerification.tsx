// app/(auth)/EmailVerification.tsx
// This file implements the Email/Phone Verification page for a mobile app built with React Native and Expo.
// It dynamically adjusts based on whether the user provided an email or phone number during signup.

import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import "../global.css";

const EmailVerification: React.FC = () => {
  // State for the verification code inputs (6 separate digits)
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  
  // Refs for each input field to enable auto-focus
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null, null, null]);
  
  // State for validation errors
  const [error, setError] = useState('');

  // State for loading (while verifying the code)
  const [isLoading, setIsLoading] = useState(false);

  // Get the userInput from navigation params
  const { userInput } = useLocalSearchParams<{ userInput: string }>();
  
  // Determine if the input is an email or phone number
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmail = userInput && emailRegex.test(userInput);
  const verificationType = isEmail ? 'Email' : 'Phone';

  // Combine the 6 digits into a single code
  const combinedCode = verificationCode.join('');

  // Handle input change for each digit
  const handleCodeChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;

    const newCode = [...verificationCode];
    newCode[index] = text;
    setVerificationCode(newCode);
    
    setError('');

    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace key for each input
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && !verificationCode[index]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Validation function for the verification code
  const validateCode = (code: string) => {
    if (code.length !== 6) return 'Please enter all 6 digits';
    if (!/^\d{6}$/.test(code)) return 'Code must be a 6-digit number';
    return '';
  };

  // Handle verification code submission
  const handleVerify = async () => {
    const validationError = validateCode(combinedCode);
    setError(validationError);

    if (validationError) {
      return;
    }

    setIsLoading(true);

    try {
      console.log(`Verifying ${verificationType} with code:`, combinedCode);

      // Simulated API call to verify the code (replace with actual API call later)
      // The backend should verify the code based on whether userInput is an email or phone number
      const endpoint = isEmail ? 'verify-email' : 'verify-phone';
      
      // Commented out API call (uncomment when API is available)
      /*
      const response = await fetch(`YOUR_API_ENDPOINT/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: userInput, code: combinedCode }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`${verificationType} verification successful:`, data);
        router.push('/(auth)/Signin');
      } else {
        console.error('Verification failed:', data.message);
        setError(data.message || 'Invalid verification code. Please try again.');
      }
      */

      // Simulate successful verification
      router.push('/(auth)/Signin');
    } catch (error) {
      console.error('Network error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Back button press
  const handleBack = () => {
    router.back();
  };

  // Handle Resend button press
  const handleResend = async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log(`Resending verification code to ${userInput}`);

      // Simulated API call to resend the code (replace with actual API call later)
      // The backend should resend the code to the user's email or phone number
      /*
      const response = await fetch('YOUR_API_ENDPOINT/resend-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: userInput }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification code');
      }
      */

      setError('Code resent successfully.');
    } catch (err) {
      console.error('Error resending code:', err);
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Paste functionality for verification code
  const handlePaste = async (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 6).split('');
    
    const newCode = [...verificationCode];
    digits.forEach((digit, index) => {
      if (index < 6) newCode[index] = digit;
    });
    
    setVerificationCode(newCode);
    
    if (digits.length < 6 && digits.length > 0) {
      inputRefs.current[digits.length]?.focus();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity onPress={handleBack} className="mt-2">
          <Text className="text-red-500 text-base font-semibold">Back</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text className="text-2xl font-bold text-center mt-8 mb-2">
          Verify Your {verificationType}
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          Enter the 6-digit code sent to your {verificationType.toLowerCase()}
        </Text>

        {/* Verification Code Input Boxes */}
        <View className="flex-row justify-between mb-6">
          {verificationCode.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              className={`w-12 h-12 border ${
                error ? 'border-red-500' : 'border-gray-300'
              } rounded-lg text-center text-lg font-bold`}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              selectionColor="#EF4444"
            />
          ))}
        </View>

        {/* Error/Success Message */}
        {error ? (
          <Text
            className={`text-sm text-center mb-4 ${
              error.includes('successfully') ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {error}
          </Text>
        ) : null}

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerify}
          className={`rounded-lg py-3 mb-4 ${
            combinedCode.length === 6 && !isLoading ? 'bg-red-500' : 'bg-gray-400'
          }`}
          disabled={combinedCode.length !== 6 || isLoading}
        >
          <Text className="text-white text-center font-semibold text-base">
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Text>
        </TouchableOpacity>
        
        {/* Resend Code Option */}
        <View className="flex-row justify-center mt-4">
          <Text className="text-gray-600">Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResend} disabled={isLoading}>
            <Text className="text-red-500 font-semibold">Resend</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EmailVerification;