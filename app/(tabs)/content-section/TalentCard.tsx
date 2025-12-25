import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import Assets from "../../../assets";

// Shared profile press handler
const handleProfilePress = (talent: any) => {
  console.log("Profile pressed:", talent.id, "Stories:", talent.stories?.length || 0);
  if (talent.hasStatus && talent.stories?.length > 0) {
    router.push({
      pathname: "/(tabs)/status",
      params: {
        id: talent.id,
        name: talent.name,
        stories: JSON.stringify(talent.stories),
      },
    });
  } else {
    console.log("No stories or hasStatus false for talent:", talent.id);
    router.push(`/(tabs)/profile?id=${talent.id}`);
  }
};

const TalentCard: React.FC<{
  talent: any;
  showButtons?: boolean;
  isHorizontal?: boolean;
  onFavoriteToggle?: (id: string) => void;
  isFavorite?: boolean;
}> = ({
  talent,
  showButtons = false,
  isHorizontal = false,
  onFavoriteToggle,
  isFavorite = false,
  
}) => {
  // console.log(`TalentCard - ID: ${talent.id}, Badge: ${talent.badge}, Badge-Color:${talent.badgeColor} `);
  const handleSendMessage = () => {
    router.push({
      pathname: "/(tabs)/messages",
      params: { id: talent.id },
    });
  };

  const handleHire = () => {
    console.log("Hire button pressed for talent:", talent.id);
  };

  return (
    <View
      className={`bg-white rounded-lg p-4 mb-4 ${
        isHorizontal ? "mr-4 border border-gray-200" : "border border-gray-200"
      }`}
      style={isHorizontal ? { width: 300 } : {}}
    >
      <View className="flex-row mb-2">
        {/* Profile Image */}
        <TouchableOpacity onPress={() => handleProfilePress(talent)} className="mr-3">
          <View className="relative">
            <Image
              source={{ uri: talent.image }}
              className="w-12 h-12 rounded-full"
              resizeMode="cover"
              // defaultSource={require('../../../assets/images/profile1.png')}
              // onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
            />
            {talent.hasStatus && (
              <View className="absolute -inset-0.5 border-2 border-pink-500 rounded-full" />
            )}
          </View>
        </TouchableOpacity>
        {/* Profile Info */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-base font-semibold text-black mr-2">
                {talent.name}
              </Text>
              <View className="flex-row items-center">
                <Assets.icons.star  height={16} width={16} fill="#facc15"/>
                <Text className="text-sm text-gray-600">
                  {talent.rating} ({talent.reviews})
                </Text>
              </View>
            </View>
            {/* Favorite Button */}
            <TouchableOpacity
              onPress={onFavoriteToggle ? () => onFavoriteToggle(talent.id) : undefined}
            >
              {/* <Assets.icons.heart
                width={24}
                height={24}
                stroke="#9CA3AF"
                strokeWidth="1.5"
                fill={showButtons && isFavorite ? "#FF0000" : "none"}
              /> */}
              <Assets.icons.heart
                width={24}
                height={24}
                stroke={isFavorite ? "#FF0000" : "#9CA3AF"}  //#9CA3AF
                strokeWidth="1.5"
                fill={isFavorite ? "#FF0000" : "none"}
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
          <View className={`${talent.badgeColor} rounded-lg px-2 py-1`}>
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
      {/* Action Buttons (Conditional) */}
      {showButtons && (
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
      )}
    </View>
  );
};

export default TalentCard;