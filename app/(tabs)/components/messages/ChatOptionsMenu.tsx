import React from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ChatOptionsMenuProps = {
  visible: boolean;
  onClose: () => void;
  onHire: () => void;
  onUploadAttachments: () => void;
  position?: { x: number; y: number };
};

const ChatOptionsMenu: React.FC<ChatOptionsMenuProps> = ({
  visible,
  onClose,
  onHire,
  onUploadAttachments,
  position,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-transparent">
          <View 
            className="absolute bg-white rounded-lg shadow-lg border border-gray-200 min-w-[240px]"
            style={{
              bottom: 75, // Position above the input field
              left: 12,
            }}
          >
            {/* Hire Option */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-4 border-b border-gray-100"
              onPress={() => {
                onHire();
                onClose();
              }}
            >
              <Ionicons name="document-text-outline" size={24} color="#000" />
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-black">Hire</Text>
                <Text className="text-sm text-gray-500">(job requirements)</Text>
              </View>
            </TouchableOpacity>

            {/* Upload Attachments Option */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-4"
              onPress={() => {
                onUploadAttachments();
                onClose();
              }}
            >
              <Ionicons name="attach-outline" size={24} color="#000" />
              <Text className="ml-3 text-base font-semibold text-black">Upload Attachments</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ChatOptionsMenu;

