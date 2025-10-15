import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';

type CardVariant = 'standard' | 'gradient';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: CardVariant;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  onPress, 
  style,
  variant = 'standard',
}) => {
  const content = (
    <View style={[styles.content]}>
      {children}
    </View>
  );

  if (variant === 'gradient') {
    const gradientCard = (
      <LinearGradient
        colors={[Colors.primary, Colors.blue]} // cyan-500 to blue-600
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, styles.gradientCard, style]}
      >
        {content}
      </LinearGradient>
    );

    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          {gradientCard}
        </TouchableOpacity>
      );
    }
    return gradientCard;
  }

  // Standard card
  const standardCard = (
    <View style={[styles.card, styles.standardCard, style]}>
      {content}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {standardCard}
      </TouchableOpacity>
    );
  }

  return standardCard;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  standardCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gradientCard: {
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    padding: 16,
  },
});

