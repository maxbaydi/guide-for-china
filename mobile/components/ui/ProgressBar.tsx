import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';

interface ProgressBarProps {
  progress: number; // 0 to 1
  variant?: 'gradient' | 'solid' | 'warning';
  style?: ViewStyle;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = 'gradient',
  style,
  height = 8,
}) => {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  const getBarColor = () => {
    if (variant === 'warning') return Colors.secondary; // orange-500
    if (variant === 'solid') return Colors.primary; // cyan-500
    return null; // gradient will be used
  };

  const barColor = getBarColor();

  return (
    <View style={[styles.container, { height }, style]}>
      {variant === 'gradient' ? (
        <LinearGradient
          colors={[Colors.primary, Colors.blue]} // cyan-500 to blue-600
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.bar,
            {
              width: `${clampedProgress * 100}%`,
              height,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.bar,
            {
              backgroundColor: barColor,
              width: `${clampedProgress * 100}%`,
              height,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.border, // gray-200
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    borderRadius: 4,
  },
});

