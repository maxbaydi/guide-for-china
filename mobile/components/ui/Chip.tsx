import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface ChipProps {
  children: React.ReactNode;
  onPress?: () => void;
  selected?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  onPress,
  selected = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, selected && styles.selectedChip]}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    backgroundColor: Colors.borderLight, // gray-100
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  selectedChip: {
    backgroundColor: Colors.primary, // cyan-500
  },
  text: {
    color: Colors.text, // gray-800
    fontWeight: '600',
    fontSize: 14,
  },
  selectedText: {
    color: Colors.white,
  },
});
