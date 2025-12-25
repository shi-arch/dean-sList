import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../../../api/axiosInstance";
import Assets from "../../../assets";



// Shared profile press handler
const handleProfilePress = (talent: any) => {
  console.log('Profile pressed:', talent.id, 'Stories:', talent.stories?.length || 0);
  if (talent.hasStatus && talent.stories?.length > 0) {
    router.push({
      pathname: '/(tabs)/status',
      params: {
        id: talent.id,
        name: talent.name,
        stories: JSON.stringify(talent.stories),
      },
    });
  } else {
    console.log('No stories or hasStatus false for talent:', talent.id);
    router.push(`/(tabs)/profile?id=${talent.id}`);
  }
};

const handleProfileNamePress = (talent: any) => {
  router.push(`/(tabs)/profile?id=${talent.id}`);
}


// Talent Card component for horizontal scrolling sections
const TalentCard = ({ talent }: { talent: any }) => {
  

  return (
    <View
      className="bg-white rounded-lg p-4 mb-4 mr-4 border border-gray-200"
      style={{ width: 300 }}
    >
      <View className="flex-row mb-2">
        {/* Profile Image and Info */}
        <View className="flex-row flex-1">
          <TouchableOpacity
            onPress={() => handleProfilePress(talent)}
            className="mr-3"
          >
            <View className="relative">
              <Image
                source={talent.image}
                className="w-10 h-10 rounded-full"
                resizeMode="cover"
              />
              {talent.hasStatus && (
                <View className="absolute -inset-0.5 border-2 border-pink-500 rounded-full" />
              )}
            </View>
          </TouchableOpacity>
          <View>
            <TouchableOpacity onPress={() => handleProfileNamePress(talent)}>
              <View className="flex-row items-center">
                <Text className="text-base font-semibold text-black mr-2">
                  {talent.name}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-yellow-500">★</Text>
                  <Text className="text-sm text-gray-600">
                    {talent.rating} ({talent.reviews})
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            <View className="flex flex-row items-center">
              <Text className="text-sm text-gray-500 ml-1">
                {talent.location}
              </Text>
              <Assets.icons.aeroplane height={12} width={12} />
            </View>
          </View>
        </View>

        {/* Favorite Button */}
        <TouchableOpacity>
          <Assets.icons.heart
            width={24}
            height={24}
            stroke="#9CA3AF"
            strokeWidth="1.5"
            fill="none"
          />
        </TouchableOpacity>
      </View>

      {/* Price and Hire Button */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-base text-gray-700 font-semibold">
          Starting from {talent.price}
        </Text>
        <TouchableOpacity className="bg-purple-500 rounded-lg px-4 py-1">
          <Text className="text-white font-medium">{talent.badge}</Text>
        </TouchableOpacity>
      </View>

      {/* Description */}
      <Text className="text-gray-600 mb-3">{talent.description}</Text>

      {/* Tags */}
      <View className="flex-row">
        {talent.tags.map((tag: string, index: number) => (
          <View key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2">
            <Text className="text-sm text-gray-700">{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Browse Talent Card component
const BrowseTalentCard = ({ talent }: { talent: any }) => {
   

  return (
    <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
      <View className="flex-row mb-2">
        {/* Profile Image and Info */}
        <View className="flex-row flex-1">
          <TouchableOpacity
            onPress={() => handleProfilePress(talent)}
            className="mr-3"
          >
            <View className="relative">
              <Image
                source={talent.image}
                className="w-10 h-10 rounded-full"
                resizeMode="cover"
              />
              {talent.hasStatus && (
                <View className="absolute -inset-0.5 border-2 border-pink-500 rounded-full" />
              )}
            </View>
          </TouchableOpacity>
          <View>
            <View className="flex-row items-center">
              <Text className="text-base font-semibold text-black mr-2">
                {talent.name}
              </Text>
            </View>
            <View className="flex flex-row items-center">
              <Text className="text-sm text-gray-500 ml-1">
                {talent.location}
              </Text>
              <Assets.icons.aeroplane height={12} width={12} />
            </View>
          </View>
        </View>

        {/* Favorite Button */}
        <TouchableOpacity>
          <Assets.icons.heart
            width={24}
            height={24}
            stroke="#9CA3AF"
            strokeWidth="1.5"
            fill="none"
          />
        </TouchableOpacity>
      </View>

      {/* Price and Hire Button */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-base text-gray-700 font-semibold">
          Starting from {talent.price}
        </Text>
        <TouchableOpacity
          className={`${talent.buttonColor} rounded-lg px-4 py-1`}
        >
          <Text className="text-white font-medium">{talent.badge}</Text>
        </TouchableOpacity>
      </View>

      {/* Description */}
      <Text className="text-gray-600 mb-3">{talent.description}</Text>

      {/* Tags */}
      <View className="flex-row">
        {talent.tags.map((tag: string, index: number) => (
          <View key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2">
            <Text className="text-sm text-gray-700">{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const SearchResultCard = ({
  talent,
  onFavoriteToggle,
  isFavorite,
}: {
  talent: any;
  onFavoriteToggle: (id: string) => void;
  isFavorite: boolean;
}) => {
  const handleSendMessage = () => {
    router.push({
      pathname: '/(tabs)/messages',
      params: { id: talent.id },
    });
  };

  const handleHire = () => {
    console.log('Hire button pressed for talent:', talent.id);
  };

  return (
    <View className="bg-white p-4 border-b border-gray-200">
      <View className="flex-row mb-2">
        {/* Profile Image */}
        <TouchableOpacity onPress={() => handleProfilePress(talent)}>
          <Image source={talent.image} className="w-12 h-12 rounded-full m-0" />
          {talent.hasStatus && (
            <View className="absolute -inset-0.5 border-2 border-pink-500 rounded-full" />
          )}
        </TouchableOpacity>
        {/* Profile Info */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-base font-semibold">{talent.name}</Text>
              <View className="flex-row items-center ml-2">
                <Text className="text-yellow-500">★</Text>
                <Text className="text-sm text-gray-600">
                  {talent.rating} ({talent.reviews})
                </Text>
              </View>
            </View>
            {/* Favorite Button */}
            <TouchableOpacity onPress={() => onFavoriteToggle(talent.id)}>
              <Assets.icons.heart
                width={24}
                height={24}
                stroke="#9CA3AF"
                strokeWidth="1.5"
                fill={isFavorite ? '#FF0000' : 'none'}
              />
            </TouchableOpacity>
          </View>
          <View className="flex flex-row items-center">
            <Text className="text-sm text-gray-500 ml-1">{talent.location}</Text>
            <Assets.icons.aeroplane height={12} width={12} />
          </View>
        </View>
      </View>
      {/* Price and Badge */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-base text-gray-700 font-semibold">
          Starting from {talent.price}
        </Text>
        {talent.badge && (
          <View
            className={`${talent.badgeColor || 'bg-blue-500'} rounded-lg px-2 py-1`}
          >
            <Text className="text-white text-xs font-medium">{talent.badge}</Text>
          </View>
        )}
      </View>
      {/* Description */}
      <Text className="text-gray-600 mb-3">{talent.description}</Text>
      {/* Tags */}
      <View className="flex-row mb-3">
        {talent.tags.map((tag: string, index: number) => (
          <View key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2">
            <Text className="text-sm text-gray-700">{tag}</Text>
          </View>
        ))}
      </View>
      {/* Action Buttons */}
      <View className="flex-row">
        <TouchableOpacity
          className="flex-1 border border-gray-300 rounded-lg py-2 mr-2"
          onPress={handleSendMessage}
        >
          <Text className="text-center font-medium">Send Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-red-500 rounded-lg py-2 ml-2"
          onPress={handleHire}
        >
          <Text className="text-white text-center font-medium">Hire</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ContentSection: React.FC<{ searchQuery?: string }> = ({
  searchQuery = "",
}) => {
  // NEW: State for fetched sellers
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // NEW: Constants from backend (mirrored for mapping)
  const BADGE_LABELS = {
    1: "New",
    2: "Rising Talent",
    3: "Top Rated",
    4: "Top Rated Plus",
  };
  const BADGE_COLORS = {
    1: "bg-gray-500",
    2: "bg-blue-500",
    3: "bg-green-500",
    4: "bg-purple-500",
  };
  const SERVICE_LABELS = {
    1: "Singer",
    2: "Guitarist",
    3: "Drummer",
    4: "Singer",
    5: "Guitarist",
    6: "Drummer",
    7: "Drummer",
  };

  // NEW: Map backend seller to frontend talent format
  // const mapSellerToTalent = (seller: any) => ({
  //   id: seller._id,
  //   name: `${seller.first_name} ${seller.last_name || ''}`.trim(),
  //   location: `${seller.city}, ${seller.zip_code}`,
  //   rating: seller.rating || 4.5, // Mock (add to Seller model)
  //   reviews: seller.reviews || 0, // Mock (add to Seller model)
  //   // price: seller.price || '$100', // Mock (add to Seller model)
  //   // price: `$${seller.price_range.min}-$${seller.price_range.max}` ||100,
  //   price: seller.price_range?.min ? `$${seller.price_range.min}` : '$100',
  //   // price: seller.price_range?.min && seller.price_range?.max ? `$${seller.price_range.min}-$${seller.price_range.max}` : '$100',
  //   description: seller.description || 'No description available',
  //   image: seller.image ? { uri: seller.image } : require('../../../assets/images/profile1.png'),
  //   tags: seller.services.map((id: number) => SERVICE_LABELS[id] || 'Unknown'),
  //   hasStatus: false, // Mock (add to Seller model if needed)
  //   badge: BADGE_LABELS[seller.badge] || 'New',
  //   badgeColor: BADGE_COLORS[seller.badge] || 'bg-gray-500',
  //   buttonText: 'Hire Talent', // Mock (customize per seller if needed)
  //   buttonColor: BADGE_COLORS[seller.badge] || 'bg-purple-500', // Match badge color
  // });

  const mapSellerToTalent = (seller: any) => {
  const now = new Date();
  
  console.log(`Processing seller: ${seller.first_name}`, {
    sellerId: seller._id,
    hasStoriesArray: !!seller.stories,
    storiesLength: seller.stories?.length || 0,
    stories: seller.stories
  });
  
  // Check if seller has active stories (within last 24 hours)
  const hasActiveStories =
  seller.stories?.length > 0 &&
  seller.stories.some((story: any) => {
    try {
      const storyDate = new Date(story.created_at);
      if (isNaN(storyDate.getTime())) {
        console.log("Invalid story date:", story.created_at);
        return false;
      }
      const hoursDiff = (now.getTime() - storyDate.getTime()) / (1000 * 60 * 60);
      console.log(`Story ${story.url}: ${hoursDiff} hours old`);
      return hoursDiff <= 24;
    } catch (error) {
      console.log("Error parsing story date:", error);
      return false;
    }
  });

  console.log(`Seller ${seller.first_name} hasActiveStories: ${hasActiveStories}`);

  return {
    id: seller._id,
    name: `${seller.first_name} ${seller.last_name || ""}`.trim(),
    location: `${seller.city}, ${seller.zip_code}`,
    rating: seller.rating || 4.5,
    reviews: seller.reviews || 0,
    price: seller.price_range?.min ? `$${seller.price_range.min}` : "$100",
    description: seller.description || "No description available",
    image: seller.image
      ? { uri: seller.image }
      : require("../../../assets/images/profile1.png"),
    tags: seller.services.map(
      (id: number) => SERVICE_LABELS[id] || "Unknown"
    ),
    hasStatus: hasActiveStories,
    badge: BADGE_LABELS[seller.badge] || "New",
    badgeColor: BADGE_COLORS[seller.badge] || "bg-gray-500",
    buttonText: "Hire Talent",
    buttonColor: BADGE_COLORS[seller.badge] || "bg-purple-500",
    stories: seller.stories || [],
  };
};
  const fetchSellers = async () => {
    try {
      setLoading(true);
      const response = await api.get("api/Sellers");
      if (response.data.success) {
        const mappedSellers = response.data.data.map(mapSellerToTalent);
        setSellers(mappedSellers);
      } else {
        setError(response.data.error || "Failed to fetch sellers");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  // NEW: Fetch sellers from API
  useEffect(() => {
    fetchSellers();
  }, []);

  // NEW: Categorize sellers (mocked, replace with backend logic if available)
  const risingTalents = sellers
    .filter((s) => s.badge === "Rising Talent")
    .slice(0, 3);
  const topRatedTalents = sellers
    .filter((s) => s.badge === "Top Rated" || s.badge === "Top Rated Plus")
    .slice(0, 3);
  const browseTalents = sellers.slice(0, 3);
  const allTalents = sellers;

  // COMMENTED: Original hardcoded data
  /*
  // Add badges to talent data
  const risingTalents = [
    { 
      id: '1', 
      name: 'Esther Ho.', 
      location: 'San Francisco, CA',
      rating: 4.5,
      reviews: 26,
      price: '$100',
      description: 'Expert Guitarist & Pop singer with extensive experience in performing at events...',
      image: require('../../../assets/images/profile1.png'),
      tags: ['Guitarist', 'Singer', 'Pop','Drummer'],
      hasStatus: true,
      badge: 'Rising Talent',
      badgeColor: 'bg-blue-500'
    },
    { 
      id: '2', 
      name: 'Esther Ho.', 
      location: 'San Francisco, CA',
      rating: 4.5,
      reviews: 26,
      price: '$100',
      description: 'Expert Guitarist & Pop singer with extensive experience in performing at events...',
      image: require('../../../assets/images/profile1.png'),
      tags: ['Guitarist', 'Singer', 'Pop'],
      hasStatus: false
    },
    { 
      id: '3', 
      name: 'Esther Ho.', 
      location: 'San Francisco, CA',
      rating: 4.5,
      reviews: 26,
      price: '$100',
      description: 'Expert Guitarist & Pop singer with extensive experience in performing at events...',
      image: require('../../../assets/images/profile1.png'),
      tags: ['Guitarist', 'Singer', 'Pop'],
      hasStatus: true
    },
  ];

  const topRatedTalents = [
    { 
      id: '4', 
      name: 'Jacob Jon.', 
      location: 'San Francisco, CA',
      rating: 4.9,
      reviews: 74,
      price: '$120',
      description: 'Expert Guitarist & Pop singer with extensive experience in performing at events...',
      image: require('../../../assets/images/profile1.png'),
      tags: ['Guitarist', 'Singer', 'Pop'],
      hasStatus: true
    },
    { 
      id: '5', 
      name: 'Jacob Jon.', 
      location: 'San Francisco, CA',
      rating: 4.9,
      reviews: 74,
      price: '$120',
      description: 'Expert Guitarist & Pop singer with extensive experience in performing at events...',
      image: require('../../../assets/images/profile1.png'),
      tags: ['Guitarist', 'Singer', 'Pop'],
      hasStatus: false
    },
    { 
      id: '6', 
      name: 'Jacob Jon.', 
      location: 'San Francisco, CA',
      rating: 4.9,
      reviews: 74,
      price: '$120',
      description: 'Expert Guitarist & Pop singer with extensive experience in performing at events...',
      image: require('../../../assets/images/profile1.png'),
      tags: ['Guitarist', 'Singer', 'Pop'],
      hasStatus: true
    },
  ];

  const browseTalents = [
    { 
      id: '7', 
      name: 'Julian King', 
      location: 'San Francisco, CA',
      price: '$100',
      buttonText: 'Rising Talent',
      buttonColor: 'bg-blue-500',
      description: 'Expert Guitarist & Pop singer with extensive experience in performing at events...',
      image: require('../../../assets/images/profile1.png'),
      tags: ['Guitarist', 'Singer', 'Pop'],
      hasStatus: true
    },
    { 
      id: '8', 
      name: 'Wade Warren', 
      location: 'San Francisco, CA',
      price: '$100',
      buttonText: 'Hire Talent',
      buttonColor: 'bg-purple-500',
      description: 'Expert Guitarist & Pop singer with extensive experience in performing at events...',
      image: require('../../../assets/images/profile1.png'),
      tags: ['Guitarist', 'Singer', 'Pop'],
      hasStatus: false
    },
    { 
      id: '9', 
      name: 'Jenny Wilson', 
      location: 'San Francisco, CA',
      price: '$100',
      buttonText: 'Deliver List Endorsed',
      buttonColor: 'bg-amber-500',
      description: 'Expert Guitarist & Pop singer with extensive experience in performing at events...',
      image: require('../../../assets/images/profile1.png'),
      tags: ['Guitarist', 'Singer', 'Pop'],
      hasStatus: true
    },
  ];

  // All talent data combined for search
  const allTalents = [...risingTalents, ...topRatedTalents, ...browseTalents];
  */

  // State for filtered results and favorites
  const [filteredTalents, setFilteredTalents] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  // Effect to handle search
  useEffect(() => {
    if (searchQuery && searchQuery.trim() !== "") {
      setIsSearching(true);
      const results = allTalents.filter(
        (talent) =>
          talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          talent.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          talent.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
      setFilteredTalents(results);
    } else {
      setIsSearching(false);
      setFilteredTalents([]); // NEW: Clear filtered talents when not searching
    }
  }, [searchQuery, allTalents]); // NEW: Added allTalents as dependency

  // NEW: If loading, show loading indicator
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="text-gray-500 mt-2">Loading sellers...</Text>
      </View>
    );
  }

  // NEW: If error, show error message
  if (error) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <Text className="text-red-500">{error}</Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 rounded-lg px-4 py-2"
          onPress={() => {
            setLoading(true);
            setError(null);
            fetchSellers(); // Uncommented
          }}
        >
          <Text className="text-white text-center font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If searching, show search results
  if (isSearching) {
    return (
      <View className="mb-6">
        {/* Saved Talent Link */}
        <View className="flex-row justify-end mb-4">
          <TouchableOpacity
            className="rounded-lg px-0 py-0"
            onPress={() => router.push("/(tabs)/saved-talent")}
          >
            <Text className="text-black text-sm font-medium">Saved Talent</Text>
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {filteredTalents.map((item) => (
          <SearchResultCard
            key={item.id}
            talent={item}
            onFavoriteToggle={toggleFavorite}
            isFavorite={favorites.includes(item.id)}
          />
        ))}

        {/* Empty State */}
        {filteredTalents.length === 0 && (
          <View className="items-center justify-center py-8">
            <Text className="text-gray-500">
              No results found for "{searchQuery}"
            </Text>
          </View>
        )}

        {/* Pagination */}
        {filteredTalents.length > 0 && (
          <View className="flex-row justify-between items-center px-4 py-2 mb-4">
            <TouchableOpacity>
              <View
                style={{
                  padding: 8,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderRadius: 4,
                }}
              >
                <Assets.icons.leftArrow
                  width={16}
                  height={16}
                  stroke="#9CA3AF"
                />
              </View>
            </TouchableOpacity>
            <Text className="text-sm text-gray-500">
              Showing {filteredTalents.length} of {allTalents.length}
            </Text>
            <TouchableOpacity>
              <View
                style={{
                  padding: 8,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderRadius: 4,
                }}
              >
                <Assets.icons.rightArrow
                  width={16}
                  height={16}
                  stroke="#9CA3AF"
                />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // Original content if not searching
  return (
    <View className="mb-6">
      {/* Rising Talent Section */}
      <Text className="text-lg font-bold text-black mb-3">Rising Talent</Text>
      <FlatList
        data={risingTalents}
        renderItem={({ item }) => <TalentCard talent={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      />

      {/* Top Rated Section */}
      <Text className="text-lg font-bold text-black mb-3 mt-4">Top Rated</Text>
      <FlatList
        data={topRatedTalents}
        renderItem={({ item }) => <TalentCard talent={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      />

      {/* Browse Talent Section */}
      <View className="mt-6">
        <Text className="text-lg font-bold text-black mb-3">Browse Talent</Text>

        {/* Column layout for browse talents */}
        <View>
          {browseTalents.map((talent) => (
            <BrowseTalentCard key={talent.id} talent={talent} />
          ))}
        </View>

        {/* Browse All Button */}
        <TouchableOpacity className="border border-gray-300 rounded-lg py-3 mt-4">
          <Text className="text-black text-center font-semibold">
            Browse All
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ContentSection;
