import { ScrollView, View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, gql } from '@apollo/client';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../../constants/Colors';
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
  const { theme, shadows } = useTheme();

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
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Avatar 
          initials={user?.username?.charAt(0) || 'U'} 
          size={96}
        />
        <Text style={[styles.userName, { color: theme.text }]}>
          {user?.username || t('common.testUser')}
        </Text>
        <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
          {user?.email}
        </Text>
      </View>

      <Card variant="elevated" style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={[styles.requestsText, { color: theme.text }]}>
            {t('profile.requestsRemainingDaily', { remaining: requestsRemaining, total: requestsLimit })}
          </Text>
          <ProgressBar 
            progress={requestsProgress} 
            variant={requestsProgress > 0.8 ? 'warning' : 'gradient'}
            style={styles.progressBar}
            height={12}
          />
          <Text style={[styles.dailyLimitInfo, { color: theme.textSecondary }]}>
            {t('profile.dailyLimitInfo')}
          </Text>
        </View>
      </Card>

      <Card variant="elevated" style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={[styles.statsTitle, { color: theme.text }]}>{t('profile.statistics')}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.primary }]}>{stats?.charactersLearned || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('profile.wordsLearned')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.primary }]}>{stats?.collectionsCount || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('profile.collections')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.primary }]}>{stats?.searchCount || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('profile.totalSearches')}</Text>
            </View>
          </View>
        </View>
      </Card>
      
      <View style={styles.actions}>
        <CustomButton 
            variant="secondary" 
            onPress={() => router.push('/settings')} 
            style={styles.actionButton}
            icon={<Settings size={20} color={theme.textInverse} />}
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
  },
  contentContainer: {
    padding: Spacing.xl,
    paddingTop: 60,
    paddingBottom: 120,
    gap: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  userName: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 16,
    letterSpacing: 0.2,
  },
  card: {
    borderRadius: BorderRadius.xl,
  },
  cardContent: {
    padding: 0,
  },
  requestsText: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: Spacing.md,
    letterSpacing: 0.2,
  },
  progressBar: {
    width: '100%',
  },
  dailyLimitInfo: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: Spacing.sm,
    lineHeight: 18,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.xl,
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    marginTop: Spacing.xs,
    letterSpacing: 0.2,
  },
  actions: {
    gap: Spacing.md,
  },
  actionButton: {
    // variant styles applied
  },
  logoutButton: {
    // variant styles applied
  },
});
