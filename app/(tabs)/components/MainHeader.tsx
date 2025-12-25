import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Assets from '../../../assets';
import { useAuth } from '../../../context/AuthContext';

interface MenuOption {
  label: string;
  action: () => void;
}

interface HeaderProps {
  title: string;
  showNotification?: boolean;
  showMoreOptions?: boolean;
  onNotificationPress?: () => void;
  onMoreOptionsPress?: () => void;
  onBackPress?: () => void;
  menuOptions?: MenuOption[];
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  showNotification = true,
  showMoreOptions = false,
  onNotificationPress,
  onMoreOptionsPress,
  onBackPress,
  menuOptions = []
}) => {
  const { isAuthenticated, logout } = useAuth();
  const [showOptions, setShowOptions] = useState(false);

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const handleMoreOptionsPress = () => {
    if (onMoreOptionsPress) {
      onMoreOptionsPress();
    } else {
      setShowOptions(!showOptions);
    }
  };

  const handleOptionPress = (option: MenuOption) => {
    setShowOptions(false);
    option.action();
  };

  // Default menu options, include logout if authenticated
  const defaultMenuOptions: MenuOption[] = [
    ...(isAuthenticated ? [{
      label: 'Logout',
      action: async () => {
        await logout();
      }
    }] : []),
    ...menuOptions
  ];

  return (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
      <TouchableOpacity onPress={handleBackPress}>
        <Assets.icons.back width={24} height={24} stroke="#000" />
      </TouchableOpacity>
      <Text className="text-xl font-bold text-black">{title}</Text>
      
      <View className="flex-row items-center">
        {showNotification && (
          <TouchableOpacity onPress={onNotificationPress} className='bg-gray-100 rounded-full p-2 mr-2'>
            <Assets.icons.notification
              width={24} 
              height={24} 
              stroke="#000000"
              strokeWidth="1.5"
              fill="none"
            />
          </TouchableOpacity>
        )}
        
        {showMoreOptions && (
          <View className="relative">
            <TouchableOpacity onPress={handleMoreOptionsPress} className='p-2'>
              <Text className="text-xl text-gray-400">⋮</Text>
            </TouchableOpacity>
            
            {showOptions && (
              <View className="absolute right-0 top-10 bg-white shadow-lg rounded-lg py-2 px-4 z-10 border border-gray-200 min-w-32">
                {defaultMenuOptions.map((option, index) => (
                  <TouchableOpacity 
                    key={index}
                    className="py-2"
                    onPress={() => handleOptionPress(option)}
                  >
                    <Text className={`${option.label === 'Logout' || option.label === 'Delete' ? 'text-red-500' : 'text-gray-800'}`}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
        
        {!showNotification && !showMoreOptions && (
          <View className="w-5" /> // Placeholder to maintain layout
        )}
      </View>
    </View>
  );
};

export default Header;