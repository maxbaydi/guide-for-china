import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { theme, shadows } = useTheme();
  
  return (
    <View style={{ position: 'relative' }}>
      <LinearGradient
        colors={[theme.primaryLighter, theme.blue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 3,
            borderColor: theme.textInverse,
          },
          shadows.medium,
          style,
        ]}
      >
        {icon ? (
          <MaterialCommunityIcons
            name={icon}
            size={size * 0.5}
            color={theme.textInverse}
          />
        ) : initials ? (
          <Text style={[
            styles.initials, 
            { 
              fontSize: size * 0.4,
              color: theme.textInverse 
            }
          ]}>
            {initials.toUpperCase().slice(0, 2)}
          </Text>
        ) : (
          <MaterialCommunityIcons
            name="account"
            size={size * 0.5}
            color={theme.textInverse}
          />
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontWeight: '700',
    letterSpacing: 1,
  },
});

