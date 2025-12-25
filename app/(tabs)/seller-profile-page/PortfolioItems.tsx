import React, { useState, useRef, useEffect } from "react";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { StyleSheet, View, Button, Image, Text } from "react-native";

// const videoSource =
//   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

interface PortfolioItemProps {
  item: {
    url: string;
    title: string;
    location: string;
    type: "video" | "audio" | "image";
  };
}

const PortfolioItems: React.FC<PortfolioItemProps> = ({ item }) => {
  const [error, setError] = useState<string | null>(null);


  const player = useVideoPlayer(item.url, (player) => {
    player.loop = true;
    player.play();
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  //For Image
  const handleImageError = () => {
    setError("Failed to load image");
  };

  return (
    <View className="w-1/2 pr-2 mb-3">
          <View className="bg-gray-200 rounded-lg aspect-[16/9] justify-center items-center relative overflow-hidden">
        <View style={styles.contentContainer}>
          <VideoView
            style={styles.video}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
            // nativeControls
          />
          {/* <Button
          title="Skip 10sec"
          onPress={() => {
            player.currentTime +=10
          }}/>
          <Button
          title="rewind 10sec"
          onPress={() => {
            player.currentTime -=10
          }}/> */}

          
        </View>
        
      </View>
      <Text
            className="text-sm font-medium mt-1 text-gray-700"
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            {item.location}
          </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: "center",
  },
  video: {
    width: 100,
    height: 200, // keeps it responsive
    borderRadius: 8,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
    width: "100%",
  },
});

export default PortfolioItems;
