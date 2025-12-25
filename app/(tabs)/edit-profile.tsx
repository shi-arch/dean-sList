import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Assets from '../../assets';
import Header from './components/MainHeader';
import ActionButtons from './components/buttons/action-button';

const EditProfile: React.FC = () => {
  const [profileData, setProfileData] = useState({
    firstName: 'Robert',
    lastName: 'Fox',
    username: 'Fox_Robert',
    email: 'robertfox@gmail.com',
    city: 'New York',
    zipCode: '475629',
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData({
      ...profileData,
      [field]: value,
    });
  };

  const handleBack = () => {
    router.back();
  };

  const handleSaveChanges = () => {
    console.log('Saving profile changes:', profileData);
    // Here you would typically make an API call to update the profile
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  const handleChangeProfileImage = () => {
    // In a real app, you would implement image picker functionality here
    console.log('Opening image picker...');
    // Example: ImagePicker.launchImageLibraryAsync({ mediaTypes: 'Images' })
  };

  return (
    <View className="flex-1 bg-white">
      <Header 
        title="Edit Profile" 
        onBackPress={handleBack}
      />
      
      <ScrollView className="flex-1 px-4">
        {/* Profile Update Section */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-black mb-1">Update Profile</Text>
          <Text className="text-gray-500 text-sm mb-4">
            Manage and update your profile settings.
          </Text>
          
          {/* Profile Image */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm mb-2">Profile image</Text>
            <View className="relative">
              <Image
                source={Assets.images.profile1}
                className="w-16 h-16 rounded-full"
                resizeMode="cover"
              />
              <TouchableOpacity 
                className="absolute bottom-0 ml-13  rounded-full p-1 border border-white"
                onPress={handleChangeProfileImage}
              >
                <Assets.icons.edit width={16} height={16} stroke="#000" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Name Fields */}
          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-gray-700 text-sm mb-2">First Name</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base"
                value={profileData.firstName}
                onChangeText={(text) => handleInputChange('firstName', text)}
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-gray-700 text-sm mb-2">Last Name</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base"
                value={profileData.lastName}
                onChangeText={(text) => handleInputChange('lastName', text)}
              />
            </View>
          </View>
          
          {/* Username */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm mb-2">Username</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base"
              value={profileData.username}
              onChangeText={(text) => handleInputChange('username', text)}
            />
          </View>
          
          {/* Email or Phone */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm mb-2">Email or Phone</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base"
              value={profileData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
            />
          </View>
          
          {/* City and Zip Code */}
          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-gray-700 text-sm mb-2">City</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base"
                value={profileData.city}
                onChangeText={(text) => handleInputChange('city', text)}
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-gray-700 text-sm mb-2">Zip Code</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base"
                value={profileData.zipCode}
                onChangeText={(text) => handleInputChange('zipCode', text)}
                keyboardType="numeric"
              />
            </View>
          </View>
          
         {/* Action Buttons */}
          <View className="mt-4 mb-10">
            <ActionButtons
              onCancel={handleCancel}
              onPrimaryAction={handleSaveChanges}
              cancelText="Cancel"
              primaryText="Save Changes"
              containerStyle="flex-row space-x-2 min-h-[44px]"
              cancelButtonStyle="border border-gray-300 rounded-lg py-3 px-4 flex-1 items-center justify-center min-w-[120px]"
              primaryButtonStyle="bg-red-500 rounded-lg py-3 px-4 flex-1 items-center justify-center min-w-[120px]"
              cancelTextStyle="text-gray-700 font-medium text-sm whitespace-nowrap"
              primaryTextStyle="text-white font-medium text-sm whitespace-nowrap"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfile;
