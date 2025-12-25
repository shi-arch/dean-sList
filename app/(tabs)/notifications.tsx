
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from './components/MainHeader';

// Define the notification type for better type safety and backend integration
interface Notification {
  id: string;
  type: 'job_post' | 'proposal' | 'message' | 'profile';
  message: string;
  timeAgo: string;
  image?: any; // This will be the user's profile image
  read: boolean;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch notifications from backend
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    
    try {
      // API integration - uncomment when backend is ready
      /* 
      const response = await fetch('https://api.example.com/notifications');
      const data = await response.json();
      setNotifications(data);
      */
      
      // Sample notifications data - this would come from your backend
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'job_post',
          message: 'Congratulations your new job post is now active on our platform.',
          timeAgo: '1 day ago',
          image: require('../../assets/images/profile1.png'),
          read: false
        },
        {
          id: '2',
          type: 'proposal',
          message: 'Julian King just submitted a proposal on your job post.',
          timeAgo: '1 day ago',
          image: require('../../assets/images/profile1.png'),
          read: false
        },
        {
          id: '3',
          type: 'message',
          message: 'You have 1 new message from Christofer Simmons.',
          timeAgo: '1 day ago',
          image: require('../../assets/images/profile1.png'),
          read: false
        },
        {
          id: '4',
          type: 'proposal',
          message: 'Leslie Alexander just submitted a proposal on your job post.',
          timeAgo: '1 day ago',
          image: require('../../assets/images/profile1.png'),
          read: false
        },
        {
          id: '5',
          type: 'proposal',
          message: 'Jenny Wilson just submitted a proposal on your job post.',
          timeAgo: '1 day ago',
          image: require('../../assets/images/profile1.png'),
          read: false
        },
        {
          id: '6',
          type: 'profile',
          message: 'Add information about yourself to complete your profile.',
          timeAgo: '1 day ago',
          read: false
        },
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Handle error state
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    // Handle notification click based on type
    switch (notification.type) {
      case 'job_post':
        router.push('/(tabs)/jobs');
        break;
      case 'proposal':
        router.push('/(tabs)/jobs');
        break;
      case 'message':
        router.push('/(tabs)/messages');
        break;
      case 'profile':
        router.push('/(tabs)/profile');
        break;
      default:
        break;
    }
    
    // Mark notification as read - uncomment when backend is ready
    /*
    fetch(`https://api.example.com/notifications/${notification.id}/read`, {
      method: 'PUT'
    })
      .then(() => {
        // Update local state to mark as read
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? {...n, read: true} : n)
        );
      })
      .catch(error => {
        console.error('Error marking notification as read:', error);
      });
    */
    
    // For now, just update the local state
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? {...n, read: true} : n)
    );
  };

  // Function to get the appropriate icon for each notification type
  const getNotificationIcon = (type: string, image?: any) => {
    if (image && type !== 'profile') {
      return (
        <Image
          source={image}
          className="w-10 h-10 rounded-full"
        />
      );
    }
    
    // For profile notifications or when no image is available
    return (
      <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
        <Text className="text-gray-500 text-xl">👤</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ marginTop: 0, paddingTop: 0 }}>
      <Header 
        title="Notifications" 
        showNotification={false}
       />
      <ScrollView className="flex-1 " contentContainerStyle={{ paddingTop: 0 }}>
        {loading ? (
          <View className="flex-1 justify-center items-center p-4">
            <Text>Loading notifications...</Text>
          </View>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              onPress={() => handleNotificationPress(notification)}
              className={`p-4 border-b border-gray-200 flex-row ${!notification.read ? 'bg-gray-50' : 'bg-white'}`}
            >
              {getNotificationIcon(notification.type, notification.image)}
              <View className="ml-3 flex-1">
                <Text className="text-gray-800 text-base">{notification.message}</Text>
                <Text className="text-gray-500 text-xs mt-1">{notification.timeAgo}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-gray-500">No notifications yet</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Notifications;

