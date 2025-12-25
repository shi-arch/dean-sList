import { router, usePathname } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Assets from '../../../assets';

const FooterSection = () => {
  const currentPath = usePathname();
  const insets = useSafeAreaInsets();

  interface NavigationScreen {
    screen: '/(tabs)/home' | '/(tabs)/orders' | '/(tabs)/jobs' | '/(tabs)/messages';
  }

  const navigateTo = (screen: NavigationScreen['screen']): void => {
    if (!isActive(screen)) {
      router.push(screen);
    }
  };

  interface TabPath {
    path: '/(tabs)/home' | '/(tabs)/orders' | '/(tabs)/jobs' | '/(tabs)/messages';
  }

  const isActive = (path: TabPath['path']): boolean => {
    const routeName = path.replace('/(tabs)/', '');
    return currentPath.includes(routeName);
  };

  const activeColor = "#FFFFFF";
  const inactiveColor = "#9CA3AF";

  return (
    <View 
      className="flex-row justify-around py-2 bg-white border-t border-gray-200"
      // style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      <TouchableOpacity
        onPress={() => navigateTo('/(tabs)/home')}
        className="items-center"
      >
        <View
          className={`p-2 w-10 h-10 flex items-center justify-center rounded-full z-10 ${
            isActive('/(tabs)/home') ? 'bg-red-500' : ''
          }`}
          style={{ overflow: 'hidden' }}
        >
          <Assets.icons.home
            width={24}
            height={24}
            stroke={isActive('/(tabs)/home') ? activeColor : inactiveColor}
            strokeWidth="1.5"
            fill="none"
          />
        </View>
        <Text
          className={`text-xs mt-1 ${
            isActive('/(tabs)/home') ? 'text-red-500 font-medium' : 'text-gray-500'
          }`}
        >
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigateTo('/(tabs)/orders')}
        className="items-center"
      >
        <View
          className={`p-2 w-10 h-10 flex items-center justify-center rounded-full z-10 ${
            isActive('/(tabs)/orders') ? 'bg-red-500' : ''
          }`}
          style={{ overflow: 'hidden' }}
        >
          <Assets.icons.orders
            width={24}
            height={24}
            stroke={isActive('/(tabs)/orders') ? activeColor : inactiveColor}
            strokeWidth="1.5"
            fill="none"
          />
        </View>
        <Text
          className={`text-xs mt-1 ${
            isActive('/(tabs)/orders') ? 'text-red-500 font-medium' : 'text-gray-500'
          }`}
        >
          Orders
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigateTo('/(tabs)/jobs')}
        className="items-center"
      >
        <View
          className={`p-2 w-10 h-10 flex items-center justify-center rounded-full z-10 ${
            isActive('/(tabs)/jobs') ? 'bg-red-500' : ''
          }`}
          style={{ overflow: 'hidden' }}
        >
          <Assets.icons.jobs
            width={24}
            height={24}
            stroke={isActive('/(tabs)/jobs') ? activeColor : inactiveColor}
            strokeWidth="1.5"
            fill="none"
          />
        </View>
        <Text
          className={`text-xs mt-1 ${
            isActive('/(tabs)/jobs') ? 'text-red-500 font-medium' : 'text-gray-500'
          }`}
        >
          Jobs
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigateTo('/(tabs)/messages')}
        className="items-center"
      >
        <View
          className={`p-2 w-10 h-10 flex items-center justify-center rounded-full z-10 ${
            isActive('/(tabs)/messages') ? 'bg-red-500' : ''
          }`}
          style={{ overflow: 'hidden' }}
        >
          <Assets.icons.messages
            width={24}
            height={24}
            stroke={isActive('/(tabs)/messages') ? activeColor : inactiveColor}
            strokeWidth="1.5"
            fill="none"
          />
        </View>
        <Text
          className={`text-xs mt-1 ${
            isActive('/(tabs)/messages') ? 'text-red-500 font-medium' : 'text-gray-500'
          }`}
        >
          Messages
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default FooterSection;