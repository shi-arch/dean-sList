import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ActionButtonsProps {
  onCancel: () => void;
  onPrimaryAction: () => void;
  cancelText?: string;
  primaryText: string;
  isPrimaryDisabled?: boolean;
  cancelButtonStyle?: string;
  primaryButtonStyle?: string;
  cancelTextStyle?: string;
  primaryTextStyle?: string;
  containerStyle?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCancel,
  onPrimaryAction,
  cancelText = 'Cancel',
  primaryText,
  isPrimaryDisabled = false,
  cancelButtonStyle = 'border border-gray-300 rounded-lg py-3',
  primaryButtonStyle = 'bg-red-500 rounded-lg py-3',
  cancelTextStyle = 'text-gray-700 text-center font-medium text-base',
  primaryTextStyle = 'text-white text-center font-medium text-base',
  containerStyle = 'flex-row space-x-3',
}) => {
  return (
    <View className={containerStyle}>
      <TouchableOpacity
        onPress={onCancel}
        className={`flex-1 mr-4 ${cancelButtonStyle}`}
      >
        <Text className={cancelTextStyle}>{cancelText}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onPrimaryAction}
        className={`flex-1 ${primaryButtonStyle}`}
        disabled={isPrimaryDisabled}
      >
        <Text className={primaryTextStyle}>{primaryText}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActionButtons;