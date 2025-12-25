import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Assets from '../../assets';
import { useAuth } from '../../context/AuthContext';
import Header from './components/MainHeader';

const Settings: React.FC = () => {
  const { logout } = useAuth();

  const handleNotificationPress = () => {
    router.push('/(tabs)/notifications');
  };

  const handleBack = () => {
    router.back();
  };

  // const navigateTo = (route: string) => {
  //   console.log('Navigating to:', route);
  //   router.push(route as any);
  // };
  const navigateTo = (route: string) => {
  console.log('Navigating to:', route);
  if (route === '/(tabs)/saved-talent') {
    router.push({
      pathname: '/(tabs)/home',
      params: { showSavedTalent: 'true' },
    });
  } else {
    router.push(route as any);
  }
};

  const handleLogout = async () => {
    await logout();
  };

  // Settings menu items
  const generalSettings = [
    {
      icon: <Assets.icons.profile width={24} height={24} stroke="#000" />,
      title: 'Edit Profile',
      route: '/(tabs)/edit-profile'
    },
    {
      icon: <Assets.icons.heart width={24} height={24} stroke="#000" />,
      title: 'Saved Talent',
      route: '/(tabs)/saved-talent'
    },
    {
      icon: <Assets.icons.passwordSecurity width={24} height={24} stroke="#000" />,
      title: 'Password & Security',
      route: '/(tabs)/components/settings/update-password'
    },
    {
      icon: <Assets.icons.dollar width={24} height={24} stroke="#000" />,
      title: 'Billing & Payments',
      route: '/(tabs)/components/settings/billing-and-payment'
    },
    {
      icon: <Assets.icons.bank width={24} height={24} stroke="#000" />,
      title: 'Expense Management',
      route: '/(tabs)/components/settings/expense-management'
    },
    {
      icon: <Assets.icons.notification width={24} height={24} stroke="#000" />,
      title: 'Notifications',
      route: '/(tabs)/components/settings/notification-settings'
    }
  ];

  const legalSettings = [
    {
      icon: <Assets.icons.privacypolicy width={24} height={24} stroke="#000" />,
      title: 'Privacy Policy',
      route: '/(tabs)/components/settings/privacy-policy'
    },
    {
      icon: <Assets.icons.termsandservices width={24} height={24} stroke="#000" />,
      title: 'Terms of Service',
      route: '/(tabs)/components/settings/terms-of-service'
    },
    {
      icon: <Assets.icons.notification width={24} height={24} stroke="#000" />,
      title: 'Help & Support',
      route: '/(tabs)/components/settings/help-support'
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header 
        title="Settings" 
        showNotification={true}
        showMoreOptions={true} // Enable more options to show logout
        onBackPress={handleBack}
        onNotificationPress={handleNotificationPress}
      />
      
      <ScrollView className="flex-1 px-4">
        {/* General Section */}
        <View className="mb-6">
          <Text className="text-gray-500 text-sm font-medium mb-2">General</Text>
          
          {generalSettings.map((item, index) => (
            <TouchableOpacity 
              key={index}
              className="flex-row items-center py-4 border-b border-gray-100"
              onPress={() => navigateTo(item.route)}
            >
              <View className="w-8 mr-3">
                {item.icon}
              </View>
              <Text className="flex-1 text-base text-gray-800">{item.title}</Text>
              <Assets.icons.rightArrow width={20} height={20} stroke="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Legal Section */}
        <View className="mb-6">
          <Text className="text-gray-500 text-sm font-medium mb-2">Legal</Text>
          
          {legalSettings.map((item, index) => (
            <TouchableOpacity 
              key={index}
              className="flex-row items-center py-4 border-b border-gray-100"
              onPress={() => navigateTo(item.route)}
            >
              <View className="w-8 mr-3">
                {item.icon}
              </View>
              <Text className="flex-1 text-base text-gray-800">{item.title}</Text>
              <Assets.icons.rightArrow width={20} height={20} stroke="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity 
          className="flex-row items-center py-4 mb-10"
          onPress={handleLogout}
        >
          <View className="w-8 mr-3">
            <Assets.icons.logout width={24} height={24} stroke="#FF385C" />
          </View>
          <Text className="flex-1 text-base text-red-500">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;