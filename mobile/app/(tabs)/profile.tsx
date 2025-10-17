import { ScrollView, View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, gql } from '@apollo/client';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/Colors';
import { Avatar } from '../../components/ui/Avatar';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Card } from '../../components/ui/Card';
import { CustomButton } from '../../components/ui/Button';
import { useEffect } from 'react';
import { Settings } from 'lucide-react-native';

const GET_MY_STATS = gql`
  query GetMyStats {
    myStatistics {
      searchCount
      charactersLearned
      analysisCount
      collectionsCount
      totalCharactersInCollections
    }
  }
`;

const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      username
      dailyRequestsUsed
      dailyRequestsLimit
      subscriptionTier
    }
  }
`;

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, logout, rateLimitsInfo } = useAuth();

  const { data, refetch } = useQuery(GET_MY_STATS, { fetchPolicy: 'cache-and-network' });
  const stats = data?.myStatistics;

  const { data: meData, refetch: refetchMe } = useQuery(GET_ME, { fetchPolicy: 'cache-and-network' });
  const userLimits = meData?.me;
  
  // Используем данные из rateLimitsInfo (которые приходят из заголовков X-RateLimit-*)
  const requestsRemaining = rateLimitsInfo.remaining;
  const requestsLimit = rateLimitsInfo.limit;
  const requestsProgress = requestsLimit > 0 ? (requestsLimit - requestsRemaining) / requestsLimit : 0;
  
  // Обновляем данные при фокусе на экране
  useEffect(() => {
    refetch();
    refetchMe();
  }, [rateLimitsInfo]);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Avatar 
          initials={user?.username?.charAt(0) || 'U'} 
          size={80}
        />
        <Text style={styles.userName}>
          {user?.username || t('common.testUser')}
        </Text>
        <Text style={styles.userEmail}>
          {user?.email}
        </Text>
      </View>

      <Card style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.requestsText}>
            {t('profile.requestsRemainingDaily', { remaining: requestsRemaining, total: requestsLimit })}
          </Text>
          <ProgressBar 
            progress={requestsProgress} 
            variant={requestsProgress > 0.8 ? 'warning' : 'gradient'}
            style={styles.progressBar} 
          />
          <Text style={styles.dailyLimitInfo}>
            {t('profile.dailyLimitInfo')}
          </Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.statsTitle}>{t('profile.statistics')}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.charactersLearned || 0}</Text>
              <Text style={styles.statLabel}>{t('profile.wordsLearned')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.collectionsCount || 0}</Text>
              <Text style={styles.statLabel}>{t('profile.collections')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.searchCount || 0}</Text>
              <Text style={styles.statLabel}>{t('profile.totalSearches')}</Text>
            </View>
          </View>
        </View>
      </Card>
      
      <View style={styles.actions}>
        <CustomButton 
            variant="secondary" 
            onPress={() => router.push('/settings')} 
            style={styles.actionButton}
            icon={<Settings size={20} color={Colors.white} />}
        >
          {t('profile.settings')}
        </CustomButton>
         <CustomButton 
            variant="outlined" 
            onPress={handleLogout}
            style={styles.logoutButton}
        >
          {t('auth.logout')}
        </CustomButton>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 120,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text, // gray-800
  },
  userEmail: {
    fontSize: 16,
    color: Colors.textLight, // gray-500
  },
  card: {
    backgroundColor: Colors.white,
  },
  cardContent: {
    padding: 0,
  },
  requestsText: {
    textAlign: 'center',
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    width: '100%',
  },
  dailyLimitInfo: {
    textAlign: 'center',
    color: Colors.textLight,
    fontSize: 12,
    marginTop: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    // Убираем переопределение фона, чтобы использовался стиль из variant="secondary"
  },
  actionButtonLabel: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  buttonLabel: {
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    borderColor: Colors.border,
  },
});
