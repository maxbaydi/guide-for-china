import { ApolloClient, InMemoryCache, createHttpLink, from, Observable } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
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

// Флаг для предотвращения одновременных запросов на обновление токена
let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

const resolvePendingRequests = () => {
  pendingRequests.forEach((callback) => callback());
  pendingRequests = [];
};

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

// Error Link - обработка ошибок и автоматическое обновление токенов
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      console.error(
        `[GraphQL error]: Message: ${err.message}, Location: ${JSON.stringify(err.extensions)}, Path: ${err.path}`
      );

      // Проверяем на 401 ошибку (истек токен)
      if (err.extensions?.code === 'UNAUTHENTICATED' || err.message.includes('Unauthorized')) {
        const context = operation.getContext();
        
        // Если это не повторный запрос после обновления токена
        if (!context.skipRetry) {
          // Возвращаем Observable для повторного выполнения запроса после обновления токена
          return new Observable((observer) => {
            (async () => {
              try {
                if (!isRefreshing) {
                  isRefreshing = true;

                  const refreshToken = await SecureStore.getItemAsync('refreshToken');
                  
                  if (!refreshToken) {
                    throw new Error('No refresh token available');
                  }

                  // Обновляем токен через REST API
                  const { data } = await axios.post(
                    `${API_CONFIG.BASE_URL}/auth/refresh`,
                    { refreshToken },
                    {
                      headers: { 'Content-Type': 'application/json' },
                    }
                  );

                  // Сохраняем новые токены
                  await SecureStore.setItemAsync('accessToken', data.accessToken);
                  await SecureStore.setItemAsync('refreshToken', data.refreshToken);

                  isRefreshing = false;
                  resolvePendingRequests();
                } else {
                  // Ждем пока другой запрос обновит токен
                  await new Promise<void>((resolve) => {
                    pendingRequests.push(() => resolve());
                  });
                }

                // Повторяем оригинальный запрос с новым токеном
                const token = await SecureStore.getItemAsync('accessToken');
                operation.setContext({
                  headers: {
                    ...operation.getContext().headers,
                    authorization: token ? `Bearer ${token}` : '',
                  },
                  skipRetry: true, // Помечаем чтобы не повторять бесконечно
                });

                const subscriber = {
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer),
                };

                forward(operation).subscribe(subscriber);
              } catch (refreshError) {
                isRefreshing = false;
                pendingRequests = [];
                
                // Очищаем токены
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('refreshToken');
                
                if (!context.skipErrorToast) {
                  showError('Сессия истекла. Пожалуйста, войдите снова');
                }
                
                observer.error(refreshError);
              }
            })();
          });
        }
      }

      // Показываем toast для других ошибок
      const context = operation.getContext();
      if (!context.skipErrorToast) {
        const errorMessage = formatGraphQLError({ message: err.message });
        showError(errorMessage);
      }
    }
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    const context = operation.getContext();
    if (!context.skipErrorToast) {
      showError('Ошибка сети. Проверьте подключение к интернету');
    }
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

