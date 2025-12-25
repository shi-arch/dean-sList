import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, Dimensions, FlatList, ImageBackground, PixelRatio, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Assets from '../../assets';
import PaginationDots from '../components/PaginationDots';
import "../global.css";

// Get device dimensions for responsive scaling
const { height, width } = Dimensions.get('window');
const fontScale = PixelRatio.getFontScale();

// Calculate responsive scale based on screen dimensions
// Using a combination of width and height for better responsiveness
const scale = Math.min(width / 375, height / 667); // Base: iPhone 8 (375x667)
const isTablet = width >= 768;
const isSmallDevice = width < 375;

// Function to normalize sizes based on device dimensions
const normalize = (size: number) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

// Responsive font size functions
const getTitleFontSize = () => {
  if (isTablet) return normalize(24);
  if (isSmallDevice) return normalize(16);
  return normalize(20);
};

const getDescriptionFontSize = () => {
  if (isTablet) return normalize(16);
  if (isSmallDevice) return normalize(12);
  return normalize(14);
};

const getButtonFontSize = () => {
  if (isTablet) return normalize(18);
  if (isSmallDevice) return normalize(14);
  return normalize(16);
};

const getSkipFontSize = () => {
  if (isTablet) return normalize(16);
  if (isSmallDevice) return normalize(12);
  return normalize(14);
};

const onboardingData = [
  {
    title: "Let's Connect with talented artists across USA",
    description: "Explore curated selection of musician freelance services.",
    buttonText: "Next",
    image: Assets.images.onboarding1,
  },
  {
    title: "Find the perfect musician based on your needs",
    description: "Discover musicians offering a wide range of services for various categories.",
    buttonText: "Next",
    image: Assets.images.onboarding2,
  },
  {
    title: "Get started with by creating your buyer account",
    description: "Easily hire musicians by posting your project requirements and receiving proposals.",
    buttonText: "Get Started",
    image: Assets.images.onboarding3,
  },
];

const Onboarding: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const backAction = () => {
      if (currentPage === 0) {
        BackHandler.exitApp(); // Exit the app
        return true; // Prevent default behavior
      } else {
        const newPage = currentPage - 1;
        setCurrentPage(newPage);
        flatListRef.current?.scrollToIndex({ index: newPage, animated: true });
        return true; // Prevent default behavior
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); // Clean up the listener on unmount
  }, [currentPage]);

  const handleNext = () => {
    if (currentPage < onboardingData.length - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      flatListRef.current?.scrollToIndex({ index: newPage, animated: true });
    } else {
      router.push('/(auth)/Signup'); // Navigate to Signup
    }
  };

  const handleDotPress = (index: number) => {
    setCurrentPage(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleSkip = () => {
    setCurrentPage(onboardingData.length - 1);
    flatListRef.current?.scrollToIndex({ index: onboardingData.length - 1, animated: true });
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newPage = Math.round(offsetX / width);
    setCurrentPage(newPage);
  };

  const renderItem = ({ item, index }: { item: typeof onboardingData[0], index: number }) => (
    <View style={{ width: width, height: height }}>
      <ImageBackground
        source={item.image}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        <View
          className="bg-white rounded-t-3xl px-6"
          style={{
            position: 'absolute',
            bottom: 0, // Position at bottom, respecting SafeAreaView
            left: 0,
            right: 0,
            paddingTop: 20,
            paddingBottom: Math.max(insets.bottom, 20), // Ensure buttons are above navigation bar
            minHeight: height * 0.33, // Minimum height
          }}
        >
          <PaginationDots
            totalPages={onboardingData.length}
            currentPage={currentPage}
            onDotPress={handleDotPress}
          />

          <View className="mt-4" style={{ marginBottom: normalize(16) }}>
            <Text
              className="font-bold text-center"
              style={{ 
                fontSize: getTitleFontSize() * fontScale,
                lineHeight: getTitleFontSize() * fontScale * 1.3, // Small line height to prevent overlap
              }}
            >
              {item.title}
            </Text>
            <Text
              className="text-gray-600 text-center mt-2"
              style={{ 
                fontSize: getDescriptionFontSize() * fontScale,
                lineHeight: getDescriptionFontSize() * fontScale * 1.25, // Small line height for description
              }}
            >
              {item.description}
            </Text>
          </View>

          <View className="mt-auto">
            <TouchableOpacity
              onPress={handleNext}
              className="bg-red-500 rounded-full py-3"
            >
              <Text
                className="text-white text-center font-semibold"
                style={{ fontSize: getButtonFontSize() * fontScale }}
              >
                {item.buttonText}
              </Text>
            </TouchableOpacity>

            {index < onboardingData.length - 1 && (
              <TouchableOpacity onPress={handleSkip} className="mt-3">
                <Text
                  className="text-gray-500 text-center"
                  style={{ fontSize: getSkipFontSize() * fontScale }}
                >
                  Skip
                </Text>
              </TouchableOpacity>
            )}
            {index === onboardingData.length - 1 && (
              <View style={{ height: normalize(14) + normalize(8) }} />
            )}
          </View>
        </View>
      </ImageBackground>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
    </View>
  );
};

export default Onboarding;