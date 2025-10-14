import { ScrollView, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, gql } from '@apollo/client';
import { Text, Avatar, ProgressBar, Card, Button } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, logout } = useAuth();

  const { data } = useQuery(GET_MY_STATS, { fetchPolicy: 'cache-and-network' });
  const stats = data?.myStatistics;

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Avatar.Icon size={80} icon="account-circle" style={styles.avatar} />
        <Text variant="headlineMedium" style={styles.userName}>
          {user?.username || 'Test User'}
        </Text>
        <Text variant="bodyLarge" style={styles.userEmail}>
          {user?.email}
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.subscriptionHeader}>
            <Text style={styles.subscriptionTitle}>{t('profile.subscriptionStatus')}: </Text>
            <Text style={[styles.subscriptionTitle, { color: Colors.secondary }]}>FREE</Text>
          </View>
          <Text style={styles.requestsText}>{t('profile.requestsRemaining', { remaining: 34, total: 50 })}</Text>
          <ProgressBar progress={0.68} color={Colors.secondary} style={styles.progressBar} />
          <Button mode="contained" onPress={() => {}} style={styles.upgradeButton}>
            ✨ {t('profile.upgradeButton')}
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title={t('profile.statistics')} />
        <Card.Content style={styles.statsRow}>
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
        </Card.Content>
      </Card>
      
      <View style={styles.actions}>
        <Button 
            mode="contained" 
            onPress={() => router.push('/settings')} 
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
            labelStyle={styles.actionButtonLabel}
            icon="cog-outline"
        >
          {t('profile.settings')}
        </Button>
         <Button 
            mode="outlined" 
            onPress={handleLogout}
            textColor={Colors.primary}
            style={styles.logoutButton}
        >
          {t('auth.logout')}
        </Button>
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
  avatar: {
    backgroundColor: Colors.backgroundLight,
  },
  userName: {
    fontWeight: 'bold',
  },
  userEmail: {
    color: Colors.textLight,
  },
  card: {
    backgroundColor: Colors.white,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  subscriptionTitle: {
    fontWeight: '600',
    textAlign: 'center',
  },
  requestsText: {
    textAlign: 'center',
    color: Colors.textLight,
    marginVertical: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  upgradeButton: {
    marginTop: 16,
    backgroundColor: Colors.primary,
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
    fontWeight: 'bold',
  },
  statLabel: {
    color: Colors.textLight,
  },
  actions: {
      gap: 12,
  },
  actionButton: {
      backgroundColor: Colors.white,
  },
  actionButtonContent: {
      justifyContent: 'space-between',
      flexDirection: 'row-reverse',
      paddingVertical: 8,
  },
  actionButtonLabel: {
      color: Colors.text,
      fontWeight: '600',
      fontSize: 16,
  },
  logoutButton: {
      borderColor: Colors.border,
      paddingVertical: 8,
  }
});
