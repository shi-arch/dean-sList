import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import "../../../global.css";
import Header from '../MainHeader';
import ActionButtons from '../buttons/action-button';
import ToggleButton from '../buttons/toggle-button';

const NotificationSettings: React.FC = () => {
  const [notificationPrefs, setNotificationPrefs] = useState({
    accountActivityPush: false,
    accountActivityEmail: true,
    systemNotificationsPush: false,
    systemNotificationsEmail: true,
  });

  const [initialPrefs] = useState(notificationPrefs);
  const [hasChanges, setHasChanges] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleNotificationPress = () => {
    router.push('/(tabs)/notifications');
  };

  const toggleNotification = (key: keyof typeof notificationPrefs) => {
    setNotificationPrefs(prev => {
      const newPrefs = { ...prev, [key]: !prev[key] };
      const changesMade = Object.keys(newPrefs).some(
        k => newPrefs[k as keyof typeof newPrefs] !== initialPrefs[k as keyof typeof initialPrefs]
      );
      setHasChanges(changesMade);
      return newPrefs;
    });
  };

  const handleSaveChanges = () => {
    if (!hasChanges) return;
    console.log('Updated Notification Preferences:', notificationPrefs);
    router.back();
  };

  const handleCancel = () => {
    setNotificationPrefs(initialPrefs);
    setHasChanges(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <Header
        title="Notifications"
        showNotification={false}
        onBackPress={handleBack}
        onNotificationPress={handleNotificationPress}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xl font-bold text-black mb-1">
          Manage Notifications
        </Text>
        <Text className="text-sm text-gray-500 mb-6">
          Select when & how to notify you about activity on your profile.
        </Text>

        <View className="mb-6">
          <Text className="text-base font-semibold text-black mb-3">
            Account Activity
          </Text>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm text-gray-700">Push</Text>
            <ToggleButton
              isOn={notificationPrefs.accountActivityPush}
              onToggle={() => toggleNotification('accountActivityPush')}
            />
          </View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm text-gray-700">Email</Text>
            <ToggleButton
              isOn={notificationPrefs.accountActivityEmail}
              onToggle={() => toggleNotification('accountActivityEmail')}
            />
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-base font-semibold text-black mb-3">
            System Notifications
          </Text>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm text-gray-700">Push</Text>
            <ToggleButton
              isOn={notificationPrefs.systemNotificationsPush}
              onToggle={() => toggleNotification('systemNotificationsPush')}
            />
          </View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm text-gray-700">Email</Text>
            <ToggleButton
              isOn={notificationPrefs.systemNotificationsEmail}
              onToggle={() => toggleNotification('systemNotificationsEmail')}
            />
          </View>
        </View>

        <ActionButtons
          onCancel={handleCancel}
          onPrimaryAction={handleSaveChanges}
          primaryText="Save Changes"
          isPrimaryDisabled={!hasChanges}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationSettings;