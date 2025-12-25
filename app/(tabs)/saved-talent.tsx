import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import Assets from "../../assets";
import MainHeader from "./components/MainHeader";

const SavedTalent: React.FC = () => {
  // Sample saved talents data - in a real app, this would come from an API or storage
  const savedTalents = [
    {
      id: "1",
      name: "Brooklyn Simon",
      location: "San Francisco, CA",
      rating: 4.5,
      reviews: 34,
      price: "$100",
      description:
        "Expert Guitarist & Pop singer with extensive experience in performing at events...",
      image: require("../../assets/images/profile1.png"),
      tags: ["Guitarist", "Singer", "Pop"],
      badge: "Deliver List Endorsed",
      badgeColor: "bg-amber-500",
    },
    {
      id: "2",
      name: "Julian King",
      location: "San Francisco, CA",
      rating: 4.9,
      reviews: 74,
      price: "$100",
      description:
        "Expert Guitarist & Pop singer with extensive experience in performing at events...",
      image: require("../../assets/images/profile1.png"),
      tags: ["Guitarist", "Singer", "Pop"],
      badge: "Top Rated",
      badgeColor: "bg-purple-500",
    },
    {
      id: "3",
      name: "Jenny Wilson",
      location: "San Francisco, CA",
      rating: 4.5,
      reviews: 36,
      price: "$100",
      description:
        "Expert Guitarist & Pop singer with extensive experience in performing at events...",
      image: require("../../assets/images/profile1.png"),
      tags: ["Guitarist", "Singer", "Pop"],
      badge: "Rising Talent",
      badgeColor: "bg-blue-500",
    },
  ];

  const [favorites, setFavorites] = useState<string[]>(
    savedTalents.map((talent) => talent.id)
  );

  const handleNotificationPress = () => {
    router.push("/(tabs)/notifications");
  };

  const handleBack = () => {
    router.back();
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
    // In a real app, you would also update this in your backend or local storage
  };

  const handleProfilePress = (talent: any) => {
    if (talent.hasStatus) {
      router.push({
        pathname: "/(tabs)/status",
        params: { id: talent.id, name: talent.name },
      });
    } else {
      router.push(`/(tabs)/profile?id=${talent.id}`);
    }
  };

  const handleSendMessage = (id: string) => {
    router.push({
      pathname: "/(tabs)/messages",
      params: { id },
    });
  };

  const handleHire = (id: string) => {
    console.log("Hire button pressed for talent:", id);
    // Implement hire functionality
  };

  return (
      <View className="flex-1">
        <MainHeader title="Saved Talent" showNotification={true} />
        
        <FlatList
          data={savedTalents}
          renderItem={({ item }) => (
            <View className="px-4 py-2">
              <View className="bg-white rounded-lg p-4 border border-gray-200">
                {/* Profile Header */}
                <View className="flex-row mb-3">
                  <TouchableOpacity onPress={() => handleProfilePress(item)}>
                    <Image
                      source={item.image}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                  </TouchableOpacity>
                  <View className="flex-1">
                    <View className="flex-row justify-between">
                      <View>
                        <View className="flex-row items-center">
                          <Text className="text-base font-semibold">
                            {item.name}
                          </Text>
                          <View className="flex-row items-center ml-2">
                            <Text className="text-yellow-500">★</Text>
                            <Text className="text-sm text-gray-600">
                              {item.rating} ({item.reviews})
                            </Text>
                          </View>
                        </View>
                        <Text className="text-sm text-gray-500">
                          {item.location}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                          <Assets.icons.heart
                            width={24}
                            height={24}
                            stroke={favorites.includes(item.id) ? "#FF0000" : "#9CA3AF"} // red if favorite, gray otherwise
                            strokeWidth="1.5"
                            fill={favorites.includes(item.id) ? "#FF0000" : "none"} // red fill if favorite, no fill otherwise
                          />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Price and Badge */}
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-sm font-medium">
                    Starting from {item.price}
                  </Text>
                  {item.badge && (
                    <View className={`${item.badgeColor} rounded-lg px-3 py-1`}>
                      <Text className="text-white text-xs font-medium">
                        {item.badge}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Description */}
                <Text className="text-gray-600 mb-3">{item.description}</Text>

                {/* Tags */}
                <View className="flex-row flex-wrap mb-4">
                  {item.tags.map((tag: string, index: number) => (
                    <View
                      key={index}
                      className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2"
                    >
                      <Text className="text-sm text-gray-700">{tag}</Text>
                    </View>
                  ))}
                </View>

                {/* Action Buttons */}
                <View className="flex-row">
                  <TouchableOpacity
                    className="flex-1 border border-gray-300 rounded-lg py-2 mr-2"
                    onPress={() => handleSendMessage(item.id)}
                  >
                    <Text className="text-center font-medium">
                      Send Message
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-red-500 rounded-lg py-2 ml-2"
                    onPress={() => handleHire(item.id)}
                  >
                    <Text className="text-white text-center font-medium">
                      Hire
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="items-center justify-center py-8">
              <Text className="text-gray-500">No saved talent found</Text>
            </View>
          }
          ListFooterComponent={
            savedTalents.length > 0 ? (
              <View className="flex-row justify-between items-center px-4 py-4 mb-4">
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
                  Showing {savedTalents.length} of {savedTalents.length}
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
            ) : null
          }
        />
      </View>
  );
};

export default SavedTalent;
