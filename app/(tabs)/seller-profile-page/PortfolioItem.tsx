import { useAudioPlayer } from 'expo-audio';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import Assets from '@/assets';

interface PortfolioItemProps {
  item: {
    url: string;
    title: string;
    location: string;
    type: 'video' | 'audio' | 'image';
  };
}

const PortfolioItem: React.FC<PortfolioItemProps> = ({ item }) => {
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Video player
  const player = useVideoPlayer(item.type === 'video' ? item.url : '', (p) => {
    p.loop = false;
    p.muted = false;
  });

  // Audio player
  const audioPlayer = useAudioPlayer(
    item.type === 'audio' ? { uri: item.url } : null
  );

  // Sync audio player state into React state
  useEffect(() => {
    if (!audioPlayer) return;

    const interval = setInterval(() => {
      setIsPlaying(audioPlayer.playing); // reflect latest state
    }, 300);

    return () => clearInterval(interval);
  }, [audioPlayer]);

  const handleAudioPlayPause = () => {
    if (!audioPlayer) return;

    if (isPlaying) {
      audioPlayer.pause();
    } else {
      audioPlayer.play();
    }
  };

  const handleImageError = () => {
    setError('Failed to load image');
  };

  const renderPlayButton = () => {
    if (item.type !== 'audio') return null;

    const IconComponent = isPlaying
      ? Assets.icons.pause
      : Assets.icons.play;

    return (
      <TouchableOpacity
        className="absolute justify-center items-center bg-black/50 rounded-full w-10 h-10"
        onPress={handleAudioPlayPause}
      >
        <IconComponent
          width={20}
          height={20}
          fill={isPlaying ? '#FFFFFF80' : '#FFFFFF'}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View className="w-1/2 pr-2 mb-3">
      <View className="bg-gray-200 rounded-lg aspect-[16/9] justify-center items-center relative overflow-hidden">
        {item.type === 'image' ? (
          <Image
            source={{ uri: item.url }}
            className="w-full h-full rounded-lg"
            resizeMode="cover"
            onError={handleImageError}
          />
        ) : item.type === 'video' ? (
          <VideoView
            style={{ width: '100%', height: '100%' }}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
            contentFit="contain"
            nativeControls={true}
          />
        ) : item.type === 'audio' ? (
          <>
            <View className="w-full h-full justify-center items-center">
              <Assets.icons.mic width={40} height={40} fill="#666666" />
              <Text className="text-gray-600 text-xs mt-2">Audio File</Text>
            </View>
            {renderPlayButton()}
          </>
        ) : null}

        {error && (
          <View className="absolute inset-0 justify-center items-center bg-black/50 rounded-lg">
            <Text className="text-white text-xs text-center px-2">{error}</Text>
          </View>
        )}
      </View>

      <Text className="text-sm font-medium mt-1 text-gray-700" numberOfLines={2}>
        {item.title}
      </Text>
      <Text className="text-xs text-gray-500" numberOfLines={1}>
        {item.location}
      </Text>
    </View>
  );
};

export default PortfolioItem;
