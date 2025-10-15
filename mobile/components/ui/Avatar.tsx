import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface AvatarProps {
  initials?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  size?: number;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  initials,
  icon,
  size = 80,
  style,
}) => {
  return (
    <LinearGradient
      colors={[Colors.primaryLight, Colors.blue]} // cyan-400 to blue-600
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      {icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={size * 0.5}
          color={Colors.white}
        />
      ) : initials ? (
        <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
          {initials.toUpperCase().slice(0, 2)}
        </Text>
      ) : (
        <MaterialCommunityIcons
          name="account"
          size={size * 0.5}
          color={Colors.white}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: Colors.white,
    fontWeight: '700',
  },
});

