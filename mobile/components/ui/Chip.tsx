import React from 'react';
import { Chip as PaperChip } from 'react-native-paper';
import { StyleSheet } from 'react-native';
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
    <PaperChip
      mode="flat"
      onPress={onPress}
      style={[styles.chip, selected && styles.selectedChip]}
      textStyle={[styles.text, selected && styles.selectedText]}
    >
      {children}
    </PaperChip>
  );
};

const styles = StyleSheet.create({
  chip: {
    backgroundColor: 'rgba(229, 231, 235, 0.5)', // bg-gray-200/50
  },
  selectedChip: {
    backgroundColor: Colors.primary,
  },
  text: {
    color: Colors.text,
    fontFamily: 'Noto Serif SC',
  },
  selectedText: {
    color: Colors.white,
  }
});
