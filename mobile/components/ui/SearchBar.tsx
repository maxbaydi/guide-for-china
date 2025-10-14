import React from 'react';
import { Searchbar as PaperSearchBar } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmitEditing?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Поиск...',
  onSubmitEditing,
}) => {
  return (
    <PaperSearchBar
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmitEditing}
      style={styles.searchbar}
      icon="magnify"
      inputStyle={styles.input}
      elevation={0}
    />
  );
};

const styles = StyleSheet.create({
  searchbar: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 231, 0.8)',
  },
  input: {
    paddingLeft: 0,
    marginLeft: -8,
  }
});
