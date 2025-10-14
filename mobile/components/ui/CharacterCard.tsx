import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { Card } from './Card';
import { Colors } from '../../constants/Colors';
import { Character } from '../../types/api.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CharacterCardProps {
  character: Character;
  onPress?: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onPress,
}) => {
  return (
    <Card onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.characterContent}>
            <Text style={styles.character}>{character.simplified}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.pinyin} variant="titleMedium">
                {character.pinyin}
              </Text>
              {character.definitions && character.definitions.length > 0 && (
                <Text
                  style={styles.translation}
                  variant="bodyMedium"
                  numberOfLines={2}
                >
                  {character.definitions[0]?.translation || ''}
                </Text>
              )}
            </View>
        </View>

        <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.textLight} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  characterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  character: {
    fontSize: 36,
    fontFamily: 'Noto Serif SC',
    flexShrink: 0,
  },
  pinyin: {
    fontWeight: 'bold',
    color: Colors.text,
    flexWrap: 'wrap',
  },
  translation: {
    color: Colors.textLight,
    flexWrap: 'wrap',
    flex: 1,
  },
});
