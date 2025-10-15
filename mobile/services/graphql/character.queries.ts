import { gql } from '@apollo/client';

export const GET_CHARACTER_DETAILS = gql`
  query GetCharacterDetails($id: String!) {
    getCharacter(id: $id) {
      id
      simplified
      traditional
      pinyin
      hskLevel
      frequency
      definitions {
        id
        translation
        partOfSpeech
        context
        order
      }
      examples {
        id
        chinese
        pinyin
        russian
      }
    }
  }
`;

export const GET_SIMILAR_WORDS = gql`
  query GetSimilarWords($simplified: String!, $limit: Int) {
    getSimilarWords(simplified: $simplified, limit: $limit) {
      id
      simplified
      pinyin
      mainTranslation
    }
  }
`;

export const GET_REVERSE_TRANSLATIONS = gql`
  query GetReverseTranslations($simplified: String!, $limit: Int) {
    getReverseTranslations(simplified: $simplified, limit: $limit) {
      russian
      chinese
      pinyin
    }
  }
`;

