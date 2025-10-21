import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { BorderRadius, Spacing } from '../../constants/Colors';

export const COLLECTION_ICONS = [
  'book-open-variant',
  'star',
  'heart',
  'folder',
  'bookmark',
  'lightbulb',
  'trophy',
  'target',
  'flag',
  'diamond',
  'fire',
  'notebook',
] as const;

export type CollectionIconName = typeof COLLECTION_ICONS[number];

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const IconItem: React.FC<{
  iconName: string;
  isSelected: boolean;
  onPress: () => void;
  theme: any;
  shadows: any;
}> = ({ iconName, isSelected, onPress, theme, shadows }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      style={[
        styles.iconItem,
        {
          backgroundColor: isSelected ? theme.primaryPale : theme.surface,
          borderColor: isSelected ? theme.primary : theme.border,
          borderWidth: isSelected ? 2 : 1,
        },
        isSelected && shadows.small,
        animatedStyle,
      ]}
    >
      <MaterialCommunityIcons
        name={iconName as any}
        size={32}
        color={isSelected ? theme.primary : theme.text}
      />
    </AnimatedTouchable>
  );
};

export const IconPicker: React.FC<IconPickerProps> = ({
  selectedIcon,
  onSelectIcon,
}) => {
  const { theme, shadows } = useTheme();

  return (
    <View style={styles.container}>
      <FlatList
        data={COLLECTION_ICONS}
        keyExtractor={(item) => item}
        numColumns={4}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <IconItem
            iconName={item}
            isSelected={selectedIcon === item}
            onPress={() => onSelectIcon(item)}
            theme={theme}
            shadows={shadows}
          />
        )}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  grid: {
    gap: Spacing.md,
  },
  row: {
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  iconItem: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '23%',
  },
});

