import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from "../../api/axiosInstance";

const { width, height } = Dimensions.get('window');

interface Story {
  id: string;
  image: { uri: string } | any; // Support both URI and local assets
  seen: boolean;
  created_at?: string; // Optional for backend stories
}

const StatusScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const { id, name, stories: storiesParam } = params;

  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch stories from backend
  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await api.get(`api/Sellers/${id}/stories`);
      if (response.data.success) {
        // Map backend stories to frontend format
        const mappedStories = response.data.data.map((story: any, index: number) => ({
          id: `${index}`,
          image: { uri: story.url }, // Use URL from backend
          seen: false,
          created_at: story.created_at,
        }));
        setStories(mappedStories);
      } else {
        setError(response.data.message || 'Failed to fetch stories');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Initialize stories: Try parsing from params first, then fetch from API
  useEffect(() => {
    if (storiesParam && typeof storiesParam === 'string') {
      try {
        const parsedStories = JSON.parse(storiesParam).map((story: any, index: number) => ({
          id: `${index}`,
          image: { uri: story.url },
          seen: false,
          created_at: story.created_at,
        }));
        setStories(parsedStories);
        setLoading(false);
      } catch (err) {
        console.error('Error parsing stories param:', err);
        // Fallback to fetching from API
        fetchStories();
      }
    } else {
      // No stories in params, fetch from API
      fetchStories();
    }
  }, [id, storiesParam]);

  // Progress bar logic
  useEffect(() => {
    let interval: number;

    if (!paused && stories.length > 0) {
      interval = setInterval(() => {
        if (progress < 100) {
          setProgress((prev) => prev + 0.5);
        } else {
          clearInterval(interval);
          if (currentStoryIndex < stories.length - 1) {
            setCurrentStoryIndex((prev) => prev + 1);
            setProgress(0);
          } else {
            router.back();
          }
        }
      }, 30);
    }

    return () => clearInterval(interval);
  }, [progress, currentStoryIndex, paused, stories.length]);

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      router.back();
    }
  };

  const handlePress = (event: any) => {
    const touchX = event.nativeEvent.locationX;
    if (touchX < width / 2) {
      handlePrevStory();
    } else {
      handleNextStory();
    }
  };

  const handleLongPress = () => {
    setPaused(true);
  };

  const handlePressOut = () => {
    setPaused(false);
  };

  const handleBack = () => {
    router.back();
  };

  const handleContact = () => {
    router.push(`/(tabs)/messages?id=${id}`);
  };

  const handleProfileNamePress = () => {
    router.push(`/(tabs)/profile?id=${id}`);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <Text className="text-white">Loading stories...</Text>
      </View>
    );
  }

  if (error || stories.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <Text className="text-white">{error || 'No stories available'}</Text>
        <TouchableOpacity
          onPress={fetchStories}
          className="mt-4 bg-blue-500 rounded-lg px-4 py-2"
        >
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Story content - full screen */}
      <Image
        source={stories[currentStoryIndex].image}
        style={{ width, height }}
        resizeMode="cover"
      />
      
      {/* Touch handler overlay */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressOut={handlePressOut}
        className="absolute top-0 left-0 right-0 bottom-0"
      />
      
      {/* Progress bars */}
      <SafeAreaView className="z-10 absolute top-0 left-0 right-0">
        <View className="flex-row px-2 mt-2">
          {stories.map((_, index) => (
            <View key={index} className="flex-1 h-1 bg-gray-600 mx-1 rounded-full overflow-hidden">
              {index === currentStoryIndex ? (
                <View 
                  className="h-full bg-white" 
                  style={{ width: `${progress}%` }} 
                />
              ) : index < currentStoryIndex ? (
                <View className="h-full bg-white w-full" />
              ) : null}
            </View>
          ))}
        </View>
        
        {/* User info */}
        <View className="flex-row items-center px-4 mt-3">
          <View className="relative">
            <Image 
              source={stories[currentStoryIndex].image} 
              className="w-8 h-8 rounded-full" 
            />
            <View className="absolute inset-0 border-2 border-pink-500 rounded-full" />
          </View>
          <Text className="text-white font-semibold ml-2" onPress={handleProfileNamePress}>
            {name || 'Unknown User'}
          </Text>
        </View>
      </SafeAreaView>
      
      {/* Bottom buttons */}
      <View className="absolute bottom-8 left-4 right-4">
        <View className="flex-row justify-between mb-5">
          <TouchableOpacity 
            onPress={handleBack}
            className="bg-white px-6 py-3 rounded-lg"
          >
            <Text className="text-black font-medium">Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleContact}
            className="bg-red-500 py-3 rounded-lg flex-1 ml-3 items-center"
          >
            <Text className="text-white font-medium">Contact</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default StatusScreen;