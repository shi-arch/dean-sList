import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api/axiosInstance';
import Assets from '../../assets';
import { useAuth } from '../../context/AuthContext';
import '../global.css';

const Signin: React.FC = () => {
  const { setIsAuthenticated, setRememberMe: setContextRememberMe, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: '',
  });
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false,
  });
  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // Use replace instead of dismissAll to avoid POP_TO_TOP warning
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const backAction = () => {
      if (isAuthenticated) {
        return true;
      }
      router.back();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isAuthenticated]);
  // Add this useEffect after the existing useEffects
useEffect(() => {
  // Initialize form validation with default values
  const emailError = validateEmail(formData.email);
  const passwordError = validatePassword(formData.password);
  const isValid = emailError === '' && passwordError === '';
  setIsFormValid(isValid);
}, []); // Run once on mount

  const validateEmail = (value: string) => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Enter a valid email address';
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) return 'Password is required';
    return '';
  };

  const handleFieldTouch = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    if (!touchedFields[field as keyof typeof touchedFields]) {
      setTouchedFields(prev => ({ ...prev, [field]: true }));
    }
    let fieldError = '';
    switch (field) {
      case 'email':
        fieldError = validateEmail(value.trim());
        break;
      case 'password':
        fieldError = validatePassword(value);
        break;
    }
    const newErrors = { ...errors, [field]: fieldError, general: '' };
    setErrors(newErrors);
    const emailError = field === 'email' ? fieldError : validateEmail(newFormData.email);
    const passwordError = field === 'password' ? fieldError : validatePassword(newFormData.password);
    const isValid = emailError === '' && passwordError === '';
    setIsFormValid(isValid);
  };

  const validateForm = () => {
    const newErrors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      general: '',
    };
    setErrors(newErrors);
    const valid = !Object.values(newErrors).some((error) => error !== '');
    setIsFormValid(valid);
    return newErrors;
  };

  const shouldShowError = (field: string) => {
    return (
      (submissionAttempted || touchedFields[field as keyof typeof touchedFields]) &&
      errors[field as keyof typeof errors] !== ''
    );
  };

  const handleSubmitToBackend = async () => {
    const submissionData = {
      email: formData.email.trim(),
      password: formData.password,
      rememberMe: rememberMe,
    };
    setIsLoading(true);
    try {
      console.log('Sign In Submission Data:', JSON.stringify(submissionData, null, 2));
      const response = await api.post('/api/auth/signin', submissionData);
      console.log('Sign-in successful:', response.data);

      if (rememberMe) {
        await SecureStore.setItemAsync('accessToken', response.data.token);
        await SecureStore.setItemAsync('rememberMe', 'true');
      } else {
        await SecureStore.setItemAsync('accessToken', response.data.token);
        await SecureStore.setItemAsync('rememberMe', 'false');
      }

      setIsAuthenticated(true);
      setContextRememberMe(rememberMe);
      console.log('Stored token:', await SecureStore.getItemAsync('accessToken'));

      // Use replace instead of dismissAll to avoid POP_TO_TOP warning
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.error('Error:', error);
      let errorMessage = 'Sign-in failed. Please try again.';
      
      // Handle different error types
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.response?.status === 401) {
        // Extract error message from backend response
        errorMessage = error.response?.data?.message || 'Invalid email or password.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Set error message to display to user
      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
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

    handleSubmitToBackend();
  };

  const handleAppleSignIn = () => {
    console.log('Continue with Apple pressed');
    setIsAuthenticated(true);
    // Use replace instead of dismissAll to avoid POP_TO_TOP warning
    router.replace('/(tabs)/home');
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log('Continue with Google pressed');
      setIsAuthenticated(true);
      // Use replace instead of dismissAll to avoid POP_TO_TOP warning
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      setErrors((prev) => ({
        ...prev,
        general: 'Google Sign-In failed. Please try again.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpLink = () => {
    router.push('/(auth)/Signup');
  };

  const handleForgotPassword = () => {
    console.log('Forgot Password pressed');
    router.push('/(auth)/Forgot_Password');
  };

  const handleBack = () => {
    if (!isAuthenticated) {
      router.back();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
    setContextRememberMe(!rememberMe);
  };

  if (isAuthenticated) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20}}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={handleBack} className="mt-2">
          <Text className="text-red-500 text-base font-semibold">Back</Text>
        </TouchableOpacity>

        <View className="items-center mt-6">
          <Image
            source={Assets.images.logo}
            className="w-32 h-16"
            resizeMode="contain"
          />
        </View>

        <Text className="text-2xl font-bold text-center mt-8 mb-2">
          Welcome Back!
        </Text>

        <Text className="text-gray-600 text-center mb-6">
          Enter details to sign in
        </Text>

        {errors.general ? (
          <Text className="text-red-500 text-sm text-center mb-4">{errors.general}</Text>
        ) : null}

        <View>
          <Text className="text-base font-semibold text-black mb-1">
            Email<Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            placeholder="myemail@example.com"
            placeholderTextColor="#9CA3AF"
            className={`border ${
              shouldShowError('email') ? 'border-red-500' : 'border-gray-300'
            } rounded-lg p-3 text-base mb-4`}
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            onBlur={() => handleFieldTouch('email')}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {shouldShowError('email') ? (
            <Text className="text-red-500 text-sm mb-4">{errors.email}</Text>
          ) : null}

          <Text className="text-base font-semibold text-black mb-1">
            Password<Text className="text-red-500">*</Text>
          </Text>
          <View className="relative mb-2">
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              className={`border ${
                shouldShowError('password') ? 'border-red-500' : 'border-gray-300'
              } rounded-lg p-3 text-base pr-10`}
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              onBlur={() => handleFieldTouch('password')}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <Assets.icons.closeEye width={20} height={20} />
              ) : (
                <Assets.icons.openEye width={20} height={20} />
              )}
            </TouchableOpacity>
          </View>
          {shouldShowError('password') ? (
            <Text className="text-red-500 text-sm mb-4">{errors.password}</Text>
          ) : null}

          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity
              onPress={toggleRememberMe}
              className="flex-row items-center"
            >
              <View className={`w-4 h-4 border border-gray-400 rounded mr-2 ${rememberMe ? 'bg-red-500 border-red-500' : ''}`}>
                {rememberMe && <Text className="text-white text-xs text-center leading-4">✓</Text>}
              </View>
              <Text className="text-gray-600 text-sm">Remember Me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text className="text-red-500 text-sm font-medium">Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSignIn}
          className={`rounded-lg py-3 mb-4 flex-row items-center justify-center ${
            isFormValid && !isLoading ? 'bg-red-500' : 'bg-gray-400'
          }`}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <>
              <ActivityIndicator color="#fff" size="small" className="mr-2" />
              <Text className="text-white font-semibold text-base">Signing In...</Text>
            </>
          ) : (
            <Text className="text-white text-center font-semibold text-base">Sign In</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row items-center justify-center mb-4">
          <View className="flex-1 h-[1px] bg-gray-300" />
          <Text className="mx-4 text-gray-500">or</Text>
          <View className="flex-1 h-[1px] bg-gray-300" />
        </View>

        <TouchableOpacity
          onPress={handleAppleSignIn}
          className="border border-gray-300 rounded-lg py-3 mb-3 flex-row items-center justify-center"
        >
          <View className="mr-2">
            <Assets.icons.apple width={20} height={20} />
          </View>
          <Text className="text-black font-semibold text-base">
            Continue with Apple
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleGoogleSignIn}
          className="border border-gray-300 rounded-lg py-3 mb-6 flex-row items-center justify-center"
        >
          <View className="mr-2">
            <Assets.icons.google width={20} height={20} />
          </View>
          <Text className="text-black font-semibold text-base">
            Continue with Google
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mb-6">
          <Text className="text-base">
            Don't have an account?{' '}
            <Text onPress={handleSignUpLink} className="text-red-500 font-semibold">Sign up</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signin;