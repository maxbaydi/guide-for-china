import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../constants/config';
import { showError } from '../utils/toast';
import { formatGraphQLError } from '../utils/errorHandler';

/**
 * Apollo Client для работы с GraphQL API
 */

// HTTP Link
const httpLink = createHttpLink({
  uri: API_CONFIG.GRAPHQL_URL,
});

// Auth Link - добавление токена в headers
const authLink = setContext(async (_, { headers }) => {
  try {
    const token = await SecureStore.getItemAsync('accessToken');
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  } catch (error) {
    console.error('Error getting token for GraphQL:', error);
    return { headers };
  }
});

// Error Link - обработка ошибок
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}`
      );
      
      // Показываем toast только для критичных ошибок
      // Не показываем для запросов с errorPolicy: 'ignore'
      const context = operation.getContext();
      if (!context.skipErrorToast) {
        const errorMessage = formatGraphQLError({ message });
        showError(errorMessage);
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    showError('Ошибка сети. Проверьте подключение к интернету');
  }
});

// Cache configuration
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        myCollections: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        myStatistics: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        getSimilarWords: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        getReverseTranslations: {
          merge(existing, incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

// Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default apolloClient;

