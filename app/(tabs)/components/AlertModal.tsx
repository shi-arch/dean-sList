import React from 'react';
import { Modal, Text, View } from 'react-native';
import ActionButtons from './buttons/action-button';

interface AlertModalProps {
  visible: boolean;
  title?: string;
  message: string;
  icon?: React.ReactNode;
  primaryButtonText: string;
  secondaryButtonText?: string;
  onPrimaryButtonPress: () => void;
  onSecondaryButtonPress?: () => void;
  onClose?: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  icon,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryButtonPress,
  onSecondaryButtonPress,
  onClose,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose || onSecondaryButtonPress}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white rounded-xl w-full max-w-xs p-5">
          {/* Icon */}
          {icon && (
            <View className="items-center justify-center mb-4">
              {icon}
            </View>
          )}
          
          {/* Title */}
          {title && (
            <Text className="text-lg font-bold text-center mb-2">
              {title}
            </Text>
          )}
          
          {/* Message */}
          <Text className="text-gray-700 text-center mb-4">
            {message}
          </Text>
          
          {/* Buttons - Only render if primaryButtonText is not empty */}
          {primaryButtonText && (
            <ActionButtons
              onCancel={onSecondaryButtonPress || onClose || (() => {})}
              onPrimaryAction={onPrimaryButtonPress}
              cancelText={secondaryButtonText || 'Cancel'}
              primaryText={primaryButtonText}
              containerStyle="flex-row space-x-2 min-h-[44px]"
              cancelButtonStyle="border border-gray-300 rounded-lg py-3 px-4 flex-1 items-center justify-center min-w-[120px]"
              primaryButtonStyle="bg-red-500 rounded-lg py-3 px-4 flex-1 items-center justify-center min-w-[120px]"
              cancelTextStyle="text-gray-700 font-sm whitespace-nowrap"
              primaryTextStyle="text-white font-sm whitespace-nowrap"
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default AlertModal;