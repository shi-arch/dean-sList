// import {GoogleSignin} from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api/axiosInstance';
import Assets from '../../assets';
import '../global.css';

const Signup: React.FC = () => {

  //This is for google auth login
  const [userInfo, setUserInfo] = useState(null);
  //This is for google auth
  // const [request, response, promptAsync] = Google.useAuthRequest({
  //   androidClientId:
  //     "895968454267-qedbe47059p17qe675i3dacf37fcrolt.apps.googleusercontent.com",
  //   iosClientId:
  //     "895968454267-lnpabkn51nsi00ocm4nj4emqfdon6fbu.apps.googleusercontent.com",
  //   webClientId:
  //     "895968454267-4u24od1496621vr1thu9cafj7g3idq06.apps.googleusercontent.com",
  // });

  // GoogleSignin.configure({
  //   webClientId : "895968454267-4u24od1496621vr1thu9cafj7g3idq06.apps.googleusercontent.com",
  //   // iosClientId : "895968454267-lnpabkn51nsi00ocm4nj4emqfdon6fbu.apps.googleusercontent.com",
  //   // androidClientId
  // });
//   GoogleSignin.configure({
//   webClientId: "<YOUR_WEB_CLIENT_ID>",
//   androidClientId: "<YOUR_ANDROID_CLIENT_ID>",
//   iosClientId: "<YOUR_IOS_CLIENT_ID>",
//   scopes: ['profile', 'email'],
// });



  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    city: '',
    zipCode: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    city: '',
    zipCode: '',
    password: '',
    confirmPassword: '',
    checkbox: '',
    general: '',
  });

  const [touchedFields, setTouchedFields] = useState({
    firstName: false,
    lastName: false,
    username: false,
    email: false,
    phoneNumber: false,
    city: false,
    zipCode: false,
    password: false,
    confirmPassword: false,
  });

  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  const [checked, setChecked] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const validateFirstName = (value: string) => {
    if (!value) return 'First Name is required';
    if (value.length < 2) return 'First Name must be at least 2 characters';
    return '';
  };

  const validateLastName = (value: string) => {
    if (!value) return 'Last Name is required';
    if (value.length < 2) return 'Last Name must be at least 2 characters';
    return '';
  };

  const validateUsername = (value: string) => {
    if (!value) return 'Username is required';
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
    return '';
  };

  const validateEmail = (value: string) => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Enter a valid email address';
    return '';
  };

  const validatePhoneNumber = (value: string) => {
    if (value && !/^\+?[1-9]\d{1,14}$/.test(value)) return 'Enter a valid phone number (e.g., +1234567890)';
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

  const validatePassword = (value: string) => {
    if (!value) return 'Password is required';
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?#&]{8,}$/;
    if (!passwordRegex.test(value)) {
      return 'Password must be at least 8 characters, with one uppercase, one lowercase, one number, and one special character';
    }
    return '';
  };

  const validateConfirmPassword = (password: string, confirmPassword: string) => {
    if (!confirmPassword) return 'Confirm Password is required';
    if (confirmPassword !== password) return 'Passwords do not match';
    return '';
  };

  const validateCheckbox = () => {
    if (!checked) return 'You must agree to the Terms of Service';
    return '';
  };

  const handleFieldTouch = (field: string) => {
    setTouchedFields({
      ...touchedFields,
      [field]: true,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });

    if (!touchedFields[field as keyof typeof touchedFields]) {
      handleFieldTouch(field);
    }

    let error = '';
    switch (field) {
      case 'firstName':
        error = validateFirstName(value);
        break;
      case 'lastName':
        error = validateLastName(value);
        break;
      case 'username':
        error = validateUsername(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'phoneNumber':
        error = validatePhoneNumber(value);
        break;
      case 'city':
        error = validateCity(value);
        break;
      case 'zipCode':
        error = validateZipCode(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(formData.password, value);
        break;
    }
    setErrors({ ...errors, [field]: error, general: '' });
    validateForm();
  };

  const validateForm = () => {
    const newErrors = {
      firstName: validateFirstName(formData.firstName),
      lastName: validateLastName(formData.lastName),
      username: validateUsername(formData.username),
      email: validateEmail(formData.email),
      phoneNumber: validatePhoneNumber(formData.phoneNumber),
      city: validateCity(formData.city),
      zipCode: validateZipCode(formData.zipCode),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword),
      checkbox: validateCheckbox(),
      general: '',
    };

    setErrors(newErrors);

    const valid = !Object.values(newErrors).some((error) => error !== '');
    setIsFormValid(valid);

    return newErrors;
  };

  useEffect(() => {
    validateForm();
  }, [formData, checked]);

  const handleSubmitToBackend = async () => {
    const submissionData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: formData.username,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      city: formData.city,
      zipCode: formData.zipCode,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      agreedToTerms: checked,
    };

    setIsLoading(true);

    try {
      console.log('Submitting signup data:', submissionData);

      const response = await api.post('api/auth/signup', submissionData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Signup successful:', response.data);

      router.push({
        pathname: '/(auth)/EmailVerification',
        params: { userInput: formData.email },
      });
    } catch (error: any) {
      console.error('Error during signup:', error);
      let errorMessage = 'Failed to create account. Please try again.';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
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

  const shouldShowError = (field: string) => {
    return (
      (submissionAttempted || touchedFields[field as keyof typeof touchedFields]) &&
      errors[field as keyof typeof errors] !== ''
    );
  };

  const handleAppleSignIn = () => {
    console.log('Continue with Apple pressed');
    router.push('/(auth)/Google_signin_details');
  };

  const handleGoogleSignIn = () => {
    console.log('Continue with Apple pressed');
    router.push('/(auth)/Google_signin_details');
  };

//   useEffect(() => {
//     handleGoogleSignIn()
//   }, [response])

// // Helper functions for cross-platform storage
// const getItemAsyncWeb = async (key: string) => {
//   if (Platform.OS === 'web') {
//     return localStorage.getItem(key);
//   }
//   return await SecureStore.getItemAsync(key);
// };

// const setItemAsyncWeb = async (key: string, value: string) => {
//   if (Platform.OS === 'web') {
//     localStorage.setItem(key, value);
//     return;
//   }
//   await SecureStore.setItemAsync(key, value);
// };

// const handleGoogleSignIn = async () => {
//   // Assuming `response` is passed or obtained from a Google Sign-In library
//   // You may need to adjust this based on how you're handling Google Sign-In
//   const user = await getItemAsyncWeb('@user');

//   if (!user) {
//     // Replace this with your actual Google Sign-In response handling
//     // For example, using @react-native-google-signin/google-signin or expo-auth-session
//     const response = { type: 'success', authentication: { accessToken: 'your-token-here' } }; // Placeholder
//     if (response?.type === 'success' && response.authentication?.accessToken) {
//       await getUserInfo(response.authentication.accessToken);
//     }
//   } else {
//     setUserInfo(JSON.parse(user));
//   }

//   console.log('Continue with Google pressed');
//   router.push('/(auth)/Google_signin_details');
// };

// // getUserInfo
// const getUserInfo = async (token: string) => {
//   if (!token) return;
//   try {
//     const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     const user = await response.json();

//     await setItemAsyncWeb('@user', JSON.stringify(user));
//     setUserInfo(user);
//   } catch (error) {
//     console.error('Failed to fetch user info', error);
//   }
// };

  const handleSignInLink = () => {
    router.push('/(auth)/Signin');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={handleBack} className="mt-2">
          <Text className="text-red-500 text-base font-semibold">Back</Text>
        </TouchableOpacity>

        <View className="items-center mt-6">
          <Image
            source={require('../../assets/images/logo.png')}
            className="w-36 h-16"
            resizeMode="contain"
          />
        </View>

        <Text className="text-2xl font-bold text-center mt-6">
          Sign Up To Find The Best Talent Around!
        </Text>

        {errors.general ? (
          <Text className="text-red-500 text-sm text-center mt-4">{errors.general}</Text>
        ) : null}

        <View className="mt-6">
          <View className="flex-row justify-between">
            <View className="w-[48%]">
              <Text className="text-base font-semibold text-black mb-1">
                First Name
              </Text>
              <TextInput
                placeholder="First Name"
                placeholderTextColor="#9CA3AF"
                className={`border ${
                  shouldShowError('firstName') ? 'border-red-500' : 'border-gray-300'
                } rounded-lg p-3 text-base`}
                value={formData.firstName}
                onChangeText={(text) => handleInputChange('firstName', text)}
                onBlur={() => handleFieldTouch('firstName')}
              />
              {shouldShowError('firstName') ? (
                <Text className="text-red-500 text-sm mt-1">{errors.firstName}</Text>
              ) : null}
            </View>
            <View className="w-[48%]">
              <Text className="text-base font-semibold text-black mb-1">
                Last Name
              </Text>
              <TextInput
                placeholder="Last Name"
                placeholderTextColor="#9CA3AF"
                className={`border ${
                  shouldShowError('lastName') ? 'border-red-500' : 'border-gray-300'
                } rounded-lg p-3 text-base`}
                value={formData.lastName}
                onChangeText={(text) => handleInputChange('lastName', text)}
                onBlur={() => handleFieldTouch('lastName')}
              />
              {shouldShowError('lastName') ? (
                <Text className="text-red-500 text-sm mt-1">{errors.lastName}</Text>
              ) : null}
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-base font-semibold text-black mb-1">
              Username
            </Text>
            <TextInput
              placeholder="Username"
              placeholderTextColor="#9CA3AF"
              className={`border ${
                shouldShowError('username') ? 'border-red-500' : 'border-gray-300'
              } rounded-lg p-3 text-base`}
              value={formData.username}
              onChangeText={(text) => handleInputChange('username', text)}
              onBlur={() => handleFieldTouch('username')}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {shouldShowError('username') ? (
              <Text className="text-red-500 text-sm mt-1">{errors.username}</Text>
            ) : null}
          </View>

          <View className="mt-4">
            <Text className="text-base font-semibold text-black mb-1">
              Email<Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              placeholder="Email*"
              placeholderTextColor="#9CA3AF"
              className={`border ${
                shouldShowError('email') ? 'border-red-500' : 'border-gray-300'
              } rounded-lg p-3 text-base`}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              onBlur={() => handleFieldTouch('email')}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {shouldShowError('email') ? (
              <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
            ) : null}
          </View>

          <View className="mt-4">
            <Text className="text-base font-semibold text-black mb-1">
              Phone Number
            </Text>
            <TextInput
              placeholder="Phone Number (e.g., +1234567890)"
              placeholderTextColor="#9CA3AF"
              className={`border ${
                shouldShowError('phoneNumber') ? 'border-red-500' : 'border-gray-300'
              } rounded-lg p-3 text-base`}
              value={formData.phoneNumber}
              onChangeText={(text) => handleInputChange('phoneNumber', text)}
              onBlur={() => handleFieldTouch('phoneNumber')}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="phone-pad"
            />
            {shouldShowError('phoneNumber') ? (
              <Text className="text-red-500 text-sm mt-1">{errors.phoneNumber}</Text>
            ) : null}
          </View>

          <View className="flex-row justify-between mt-4">
            <View className="w-[48%]">
              <Text className="text-base font-semibold text-black mb-1">
                City<Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="City*"
                placeholderTextColor="#9CA3AF"
                className={`border ${
                  shouldShowError('city') ? 'border-red-500' : 'border-gray-300'
                } rounded-lg p-3 text-base`}
                value={formData.city}
                onChangeText={(text) => handleInputChange('city', text)}
                onBlur={() => handleFieldTouch('city')}
              />
              {shouldShowError('city') ? (
                <Text className="text-red-500 text-sm mt-1">{errors.city}</Text>
              ) : null}
            </View>
            <View className="w-[48%]">
              <Text className="text-base font-semibold text-black mb-1">
                Zip Code<Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="Zip Code*"
                placeholderTextColor="#9CA3AF"
                className={`border ${
                  shouldShowError('zipCode') ? 'border-red-500' : 'border-gray-300'
                } rounded-lg p-3 text-base`}
                value={formData.zipCode}
                onChangeText={(text) => handleInputChange('zipCode', text)}
                onBlur={() => handleFieldTouch('zipCode')}
                keyboardType="numeric"
              />
              {shouldShowError('zipCode') ? (
                <Text className="text-red-500 text-sm mt-1">{errors.zipCode}</Text>
              ) : null}
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-base font-semibold text-black mb-1">
              Your Password<Text className="text-red-500">*</Text>
            </Text>
            <View className="relative">
              <TextInput
                placeholder="e.g., Password123!"
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
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <Assets.icons.closeEye width={20} height={20} fill="#000" />
                ) : (
                  <Assets.icons.openEye width={20} height={20} fill="#000" />
                )}
              </TouchableOpacity>
            </View>
            {shouldShowError('password') ? (
              <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>
            ) : null}
          </View>

          <View className="mt-4">
            <Text className="text-base font-semibold text-black mb-1">
              Confirm Password<Text className="text-red-500">*</Text>
            </Text>
            <View className="relative">
              <TextInput
                placeholder="Confirm Password*"
                placeholderTextColor="#9CA3AF"
                className={`border ${
                  shouldShowError('confirmPassword') ? 'border-red-500' : 'border-gray-300'
                } rounded-lg p-3 text-base pr-10`}
                secureTextEntry={!showConfirmPassword}
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                onBlur={() => handleFieldTouch('confirmPassword')}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <Assets.icons.closeEye width={20} height={20} fill="#000" />
                ) : (
                  <Assets.icons.openEye width={20} height={20} fill="#000" />
                )}
              </TouchableOpacity>
            </View>
            {shouldShowError('confirmPassword') ? (
              <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword}</Text>
            ) : null}
          </View>
        </View>

        <View className="flex-row items-center mt-4">
          <TouchableOpacity
            onPress={() => setChecked(!checked)}
            className="w-6 h-6 border border-gray-300 rounded-full items-center justify-center mr-2"
          >
            {checked && <View className="w-4 h-4 bg-red-500 rounded-full" />}
          </TouchableOpacity>
          <Text className="text-gray-600 text-sm flex-1">
            Yes, I understand and agree to the{' '}
            <Text className="text-red-500">Terms of Service</Text>, including the{' '}
            <Text className="text-red-500">User Agreement</Text>
          </Text>
        </View>
        {submissionAttempted && !checked ? (
          <Text className="text-red-500 text-sm mt-1">{errors.checkbox}</Text>
        ) : null}

        <TouchableOpacity
          onPress={handleCreateAccount}
          className={`rounded-full py-3 mt-6 mb-9 flex-row items-center justify-center ${
            isFormValid && !isLoading ? 'bg-red-500' : 'bg-gray-400'
          }`}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <>
              <ActivityIndicator color="#fff" size="small" className="mr-2" />
              <Text className="text-white font-semibold text-base">Creating Account...</Text>
            </>
          ) : (
            <Text className="text-white text-center font-semibold text-base">CREATE MY ACCOUNT</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleAppleSignIn}
          className="border border-gray-300 rounded-lg py-3 mb-3 flex-row items-center justify-center"
        >
          <View className="mr-2">
            <Assets.icons.apple width={20} height={20} fill="#000" />
          </View>
          <Text className="text-black font-semibold text-base">
            Continue with Apple
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          // onPress={promptAsync}
          onPressIn={() =>{
            // promptAsync
            handleGoogleSignIn
          }}
          className="border border-gray-300 rounded-lg py-3 mb-6 flex-row items-center justify-center"
        >
          <View className="mr-2">
            <Assets.icons.google width={20} height={20} fill="#000" />
          </View>
          <Text className="text-black font-semibold text-base">
            {/* Continue with Google == {JSON.stringify(userInfo)} */}
            Continue with Google
          </Text>
        </TouchableOpacity>

        <View className="mt-6 flex-row justify-center mb-12">
          <Text className="text-gray-600 text-base">
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={handleSignInLink}>
            <Text className="text-red-500 text-base font-semibold">Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signup;