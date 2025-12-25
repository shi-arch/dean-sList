import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Assets from '../../../../assets';
import "../../../global.css";
import ActionButtons from '../../components/buttons/action-button';
import Header from '../MainHeader';

const UpdatePassword: React.FC = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [touchedFields, setTouchedFields] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleNotificationPress = () => {
    router.push('/(tabs)/notifications');
  };

  // Validation functions
  const validatePassword = (value: string, field: string) => {
    if (!value) return `${field} is required`;
    if (value.length < 8) return `${field} must be at least 8 characters`;
    return '';
  };

  const validateConfirmNewPassword = (newPassword: string, confirmNewPassword: string) => {
    if (!confirmNewPassword) return 'Confirm New Password is required';
    if (newPassword !== confirmNewPassword) return 'Passwords do not match';
    return '';
  };

  // Handle when a field is focused/blurred
  const handleFieldTouch = (field: string) => {
    setTouchedFields(prev => ({
      ...prev,
      [field]: true,
    }));
  };

  // Handle input changes and validate in real-time
  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    if (!touchedFields[field as keyof typeof touchedFields]) {
      setTouchedFields(prev => ({
        ...prev,
        [field]: true,
      }));
    }

    let fieldError = '';
    switch (field) {
      case 'currentPassword':
        fieldError = validatePassword(value, 'Current Password');
        break;
      case 'newPassword':
        fieldError = validatePassword(value, 'New Password');
        break;
      case 'confirmNewPassword':
        fieldError = validateConfirmNewPassword(newFormData.newPassword, value);
        break;
    }

    const newErrors = { ...errors, [field]: fieldError };
    setErrors(newErrors);

    const currentPasswordError = field === 'currentPassword' ? fieldError : validatePassword(newFormData.currentPassword, 'Current Password');
    const newPasswordError = field === 'newPassword' ? fieldError : validatePassword(newFormData.newPassword, 'New Password');
    const confirmNewPasswordError = field === 'confirmNewPassword' ? fieldError : validateConfirmNewPassword(newFormData.newPassword, newFormData.confirmNewPassword);

    const isValid = currentPasswordError === '' && newPasswordError === '' && confirmNewPasswordError === '';
    setIsFormValid(isValid);
  };

  // Validate the entire form (used for final submission)
  const validateForm = () => {
    const newErrors = {
      currentPassword: validatePassword(formData.currentPassword, 'Current Password'),
      newPassword: validatePassword(formData.newPassword, 'New Password'),
      confirmNewPassword: validateConfirmNewPassword(formData.newPassword, formData.confirmNewPassword),
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

  // Function to handle submission to backend
  const handleSubmitToBackend = async () => {
    const submissionData = {
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    };

    console.log('Update Password Submission Data:', submissionData);

    // Simulate successful password update by navigating back
    router.back();
  };

  const handleSaveChanges = () => {
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

  const togglePasswordVisibility = (field: string) => {
    if (field === 'currentPassword') {
      setShowCurrentPassword(!showCurrentPassword);
    } else if (field === 'newPassword') {
      setShowNewPassword(!showNewPassword);
    } else if (field === 'confirmNewPassword') {
      setShowConfirmNewPassword(!showConfirmNewPassword);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <Header
        title="Update Password"
        showNotification={true}
        onBackPress={handleBack}
        onNotificationPress={handleNotificationPress}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text className="text-2xl font-bold text-black mt-4 mb-2">
          Update Your Password
        </Text>
        <Text className="text-gray-600 mb-6">
          Enter details to update your password
        </Text>

        {/* Form */}
        <View>
          {/* Current Password */}
          <Text className="text-base font-semibold text-black mb-1">
            Current Password<Text className="text-red-500">*</Text>
          </Text>
          <View className="relative mb-2">
            <TextInput
              placeholder="Enter your current password"
              placeholderTextColor="#9CA3AF"
              className={`border ${
                shouldShowError('currentPassword') ? 'border-red-500' : 'border-gray-300'
              } rounded-lg p-3 text-base pr-10`}
              secureTextEntry={!showCurrentPassword}
              value={formData.currentPassword}
              onChangeText={(text) => handleInputChange('currentPassword', text)}
              onBlur={() => handleFieldTouch('currentPassword')}
            />
            <TouchableOpacity
              onPress={() => togglePasswordVisibility('currentPassword')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showCurrentPassword ? (
                <Assets.icons.closeEye width={20} height={20} />
              ) : (
                <Assets.icons.openEye width={20} height={20} />
              )}
            </TouchableOpacity>
          </View>
          {shouldShowError('currentPassword') ? (
            <Text className="text-red-500 text-sm mb-4">{errors.currentPassword}</Text>
          ) : null}

          {/* New Password */}
          <Text className="text-base font-semibold text-black mb-1">
            New Password<Text className="text-red-500">*</Text>
          </Text>
          <View className="relative mb-2">
            <TextInput
              placeholder="At least 8 characters"
              placeholderTextColor="#9CA3AF"
              className={`border ${
                shouldShowError('newPassword') ? 'border-red-500' : 'border-gray-300'
              } rounded-lg p-3 text-base pr-10`}
              secureTextEntry={!showNewPassword}
              value={formData.newPassword}
              onChangeText={(text) => handleInputChange('newPassword', text)}
              onBlur={() => handleFieldTouch('newPassword')}
            />
            <TouchableOpacity
              onPress={() => togglePasswordVisibility('newPassword')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showNewPassword ? (
                <Assets.icons.closeEye width={20} height={20} />
              ) : (
                <Assets.icons.openEye width={20} height={20} />
              )}
            </TouchableOpacity>
          </View>
          {shouldShowError('newPassword') ? (
            <Text className="text-red-500 text-sm mb-4">{errors.newPassword}</Text>
          ) : null}

          {/* Confirm New Password */}
          <Text className="text-base font-semibold text-black mb-1">
            Confirm New Password<Text className="text-red-500">*</Text>
          </Text>
          <View className="relative mb-2">
            <TextInput
              placeholder="Re-enter your new password"
              placeholderTextColor="#9CA3AF"
              className={`border ${
                shouldShowError('confirmNewPassword') ? 'border-red-500' : 'border-gray-300'
              } rounded-lg p-3 text-base pr-10`}
              secureTextEntry={!showConfirmNewPassword}
              value={formData.confirmNewPassword}
              onChangeText={(text) => handleInputChange('confirmNewPassword', text)}
              onBlur={() => handleFieldTouch('confirmNewPassword')}
            />
            <TouchableOpacity
              onPress={() => togglePasswordVisibility('confirmNewPassword')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showConfirmNewPassword ? (
                <Assets.icons.closeEye width={20} height={20} />
              ) : (
                <Assets.icons.openEye width={20} height={20} />
              )}
            </TouchableOpacity>
          </View>
          {shouldShowError('confirmNewPassword') ? (
            <Text className="text-red-500 text-sm mb-4">{errors.confirmNewPassword}</Text>
          ) : null}
        </View>

        {/* Action Buttons */}
        <View className="mb-6">
          <ActionButtons
            onCancel={handleBack}
            onPrimaryAction={handleSaveChanges}
            cancelText="Cancel"
            primaryText="Save Changes"
            containerStyle="flex-row space-x-2 min-h-[44px]"
            cancelButtonStyle="border border-gray-300 rounded-lg py-3 px-4 flex-1 items-center justify-center min-w-[120px]"
            primaryButtonStyle={`rounded-lg py-3 px-4 flex-1 items-center justify-center min-w-[120px] ${isFormValid ? 'bg-red-500' : 'bg-gray-400'}`}
            cancelTextStyle="text-gray-700 font-medium text-sm whitespace-nowrap"
            primaryTextStyle="text-white font-medium text-sm whitespace-nowrap"
            isPrimaryDisabled={!isFormValid}  
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UpdatePassword;