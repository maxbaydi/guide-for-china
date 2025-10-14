import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';
import { Colors } from '../../constants/Colors';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

export const Card: React.FC<CardProps> = ({ children, onPress, style }) => {
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <PaperCard style={[styles.card, style]}>
          <PaperCard.Content>
            {children}
          </PaperCard.Content>
        </PaperCard>
      </TouchableOpacity>
    );
  }

  return (
    <PaperCard style={[styles.card, style]}>
      <PaperCard.Content>
        {children}
      </PaperCard.Content>
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});

