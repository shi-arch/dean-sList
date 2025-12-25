import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface ToggleButtonProps {
  isOn: boolean;
  onToggle: () => void;
  onColor?: string;
  offColor?: string;
  thumbColor?: string;
  width?: number;
  height?: number;
  thumbSize?: number;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  isOn,
  onToggle,
  onColor = 'bg-red-500',
  offColor = 'bg-gray-300',
  thumbColor = 'bg-white',
  width = 48, // Default width (12 * 4 for Tailwind's w-12 equivalent)
  height = 24, // Default height (6 * 4 for Tailwind's h-6 equivalent)
  thumbSize = 20, // Default thumb size (5 * 4 for Tailwind's w-5 h-5 equivalent)
}) => {
  return (
    <TouchableOpacity
      onPress={onToggle}
      className={`rounded-full flex-row items-center ${isOn ? onColor : offColor}`}
      style={{ width, height }}
    >
      <View
        className={`${thumbColor} rounded-full shadow-sm ${isOn ? 'ml-auto mr-0.5' : 'ml-0.5'}`}
        style={{ width: thumbSize, height: thumbSize }}
      />
    </TouchableOpacity>
  );
};

export default ToggleButton;