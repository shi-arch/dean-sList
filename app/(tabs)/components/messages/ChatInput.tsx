import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import Assets from '@/assets';
import ChatOptionsMenu from './ChatOptionsMenu';

type Props = {
  receiverId: string;
  onSend: (content: string, file?: any) => Promise<void>;
};

const { width } = Dimensions.get('window');

const ChatInput: React.FC<Props> = ({ receiverId, onSend }) => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!(trimmed || file) || sending) return;

    try {
      setSending(true);
      await onSend(trimmed, file || undefined);
      setMessage('');
      setFile(null);
    } catch {
      // Leave text as-is for retry/edit
    } finally {
      setSending(false);
    }
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'video/*', 'application/pdf'],
    });
    if (result.assets) setFile(result.assets[0]);
  };

  const handleHire = () => {
    // Navigate to job posting page
    router.push('/(tabs)/NewJobPost');
  };

  const handleUploadAttachments = () => {
    pickFile();
  };

  const removeFile = () => setFile(null);

  const renderFilePreview = () => {
    if (!file) return null;
    const { uri, mimeType, name } = file;

    if (mimeType?.startsWith('image/') || mimeType?.startsWith('video/')) {
      return (
        <View className="relative mt-2 rounded-lg overflow-hidden bg-gray-100">
          <Image source={{ uri }} className="w-full h-40" resizeMode="cover" />
          <TouchableOpacity className="absolute top-2 right-2 bg-black/50 rounded-full p-1" onPress={removeFile}>
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
          {mimeType?.startsWith('video/') && (
            <View className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Ionicons name="play" size={32} color="white" />
            </View>
          )}
        </View>
      );
    } else {
      // Document (PDF)
      return (
        <View className="flex-row items-center mt-2 p-3 bg-gray-100 rounded-lg">
          <Ionicons name="document-outline" size={32} color="blue-500" />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-semibold text-black" numberOfLines={1}>{name}</Text>
            <Text className="text-xs text-gray-500">PDF Document</Text>
          </View>
          <TouchableOpacity onPress={removeFile}>
            <Ionicons name="close-circle" size={20} color="gray-500" />
          </TouchableOpacity>
        </View>
      );
    }
  };

  const hasFile = !!file;
  const sendText = hasFile ? 'Send File' : 'Send';

  return (
    <View className="absolute left-0 right-0 bottom-0 bg-white border-t border-gray-200 p-3">
      {renderFilePreview()}
      <View className="flex-row items-center">
        <TouchableOpacity 
          onPress={() => setShowOptionsMenu(true)} 
          className="mr-2 p-2" 
          disabled={sending}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="gray-600" />
        </TouchableOpacity>
        <TextInput
          className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-black mr-2"
          value={message}
          onChangeText={setMessage}
          placeholder="Type Message"
          placeholderTextColor="gray-500"
          multiline
          editable={!sending}
        />
        <TouchableOpacity 
          onPress={handleSend} 
          className="p-2"
          disabled={sending || !(message.trim() || file)}
        >
          <Ionicons 
            name="paper-plane" 
            size={24} 
            color={sending || !(message.trim() || file) ? "gray-400" : "blue-500"} 
          />
        </TouchableOpacity>
      </View>

      {/* Options Menu */}
      <ChatOptionsMenu
        visible={showOptionsMenu}
        onClose={() => setShowOptionsMenu(false)}
        onHire={handleHire}
        onUploadAttachments={handleUploadAttachments}
      />
    </View>
  );
};

export default ChatInput;