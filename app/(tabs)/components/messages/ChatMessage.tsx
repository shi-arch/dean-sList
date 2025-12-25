import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Message = {
  text?: string;
  file?: { url: string; type: 'image' | 'video' | 'document' };
  createdAt: string;
  status?: 'pending' | 'sent' | 'failed';
};

type Props = {
  message: Message;  // Ensure it's always an object
  isSender: boolean;
  status?: 'pending' | 'sent' | 'failed';
  onRetry?: () => void;
  senderAvatar?: any;
  receiverAvatar?: any;
};

const ChatMessage: React.FC<Props> = ({ message, isSender, status, onRetry, senderAvatar, receiverAvatar }) => {
  // Safety check: If message is not an object, return null or empty
  if (typeof message !== 'object' || message === null) {
    return <View className="mb-2" />;  // Empty placeholder
  }

  const time = message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  const renderFilePreview = () => {
    if (!message.file || typeof message.file !== 'object') return null;
    const { url, type } = message.file;

    if (type === 'image') {
      return (
        <View className="mb-2 rounded-lg overflow-hidden">
          <Image source={{ uri: url }} className="w-48 h-48" resizeMode="cover" />
        </View>
      );
    }
    if (type === 'video') {
      return (
        <View className="relative w-48 h-48 rounded-lg overflow-hidden mb-2">
          <Image source={{ uri: url }} className="w-full h-full" resizeMode="cover" />
          <View className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Ionicons name="play" size={32} color="white" />
          </View>
        </View>
      );
    }
    if (type === 'document') {
      return (
        <View className="flex-row items-center bg-gray-100 p-3 rounded-lg mb-2">
          <Ionicons name="document-outline" size={32} color="blue-500" />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-semibold text-black">PDF Document</Text>
          </View>
        </View>
      );
    }
    return null;
  };

  const renderStatus = () => {
    if (!isSender) return null;
    switch (status) {
      case 'pending':
        return <Ionicons name="time-outline" size={16} color="gray-500" className="ml-1" />;
      case 'sent':
        return <Ionicons name="checkmark-done-outline" size={16} color="gray-500" className="ml-1" />;
      case 'failed':
        return (
          <TouchableOpacity onPress={onRetry}>
            <Ionicons name="alert-circle-outline" size={16} color="red-500" className="ml-1" />
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const bubbleContent = (
    <View>
      {renderFilePreview()}
      {message.text ? (
        <Text className={`text-base mb-1 ${isSender ? 'text-black' : 'text-black'}`}>
          {message.text}
        </Text>
      ) : null}
      <View className={`flex-row items-center mt-1 ${isSender ? 'justify-end' : 'justify-start'}`}>
        <Text className="text-xs text-gray-500">{time}</Text>
        {renderStatus()}
      </View>
    </View>
  );

  return (
    <View className={`w-full mb-4 flex-row ${isSender ? 'justify-end' : 'justify-start'}`}>
      {!isSender && senderAvatar && (
        <Image 
          source={senderAvatar} 
          className="w-8 h-8 rounded-full mr-2 self-end mb-1" 
          resizeMode="cover"
        />
      )}
      <View className={`max-w-[75%] ${isSender ? 'bg-white' : 'bg-gray-200'} rounded-lg p-3 shadow-sm`}>
        {bubbleContent}
      </View>
      {isSender && receiverAvatar && (
        <Image 
          source={receiverAvatar} 
          className="w-8 h-8 rounded-full ml-2 self-end mb-1" 
          resizeMode="cover"
        />
      )}
    </View>
  );
};

export default ChatMessage;