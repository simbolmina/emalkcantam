import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Text,
  Card,
  List,
  ActivityIndicator,
  Divider,
  Button,
  IconButton,
  TouchableRipple,
} from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { Trade } from '../../src/models/Trade';
import { Communication } from '../../src/models/Communication';
import { tradeStorage } from '../../src/services/tradeStorage';
import { communicationStorage } from '../../src/services/communicationStorage';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function DashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [metrics, setMetrics] = useState({
    activeProperties: 0,
    pendingProperties: 0,
    soldThisMonth: 0,
    totalCommission: 0,
    upcomingReminders: 0,
  });

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      const [allTrades, allCommunications] = await Promise.all([
        tradeStorage.getAll(),
        communicationStorage.getAll(),
      ]);

      setTrades(allTrades);
      setCommunications(allCommunications);

      // Calculate metrics
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const activeProperties = allTrades.filter(
        (t) => t.status === 'active'
      ).length;
      const pendingProperties = allTrades.filter(
        (t) => t.status === 'pending'
      ).length;

      const thisMonthSales = allTrades.flatMap(
        (t) => t.sales?.filter((s) => new Date(s.date) >= startOfMonth) ?? []
      );

      const totalCommission = thisMonthSales.reduce(
        (sum, sale) => sum + sale.commission,
        0
      );

      const upcomingReminders = allCommunications.filter(
        (c) =>
          c.reminder && !c.reminder.completed && new Date(c.reminder.date) > now
      ).length;

      setMetrics({
        activeProperties,
        pendingProperties,
        soldThisMonth: thisMonthSales.length,
        totalCommission,
        upcomingReminders,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: tr });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const recentSales = trades
    .flatMap(
      (trade) =>
        trade.sales?.map((sale) => ({
          ...sale,
          propertyTitle: trade.propertyDetails.title,
          tradeId: trade.id,
        })) ?? []
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const upcomingReminders = communications
    .filter(
      (c) =>
        c.reminder &&
        !c.reminder.completed &&
        new Date(c.reminder.date) > new Date()
    )
    .sort(
      (a, b) =>
        new Date(a.reminder!.date).getTime() -
        new Date(b.reminder!.date).getTime()
    )
    .slice(0, 5);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.metricsContainer}>
        <Card style={[styles.metricCard, { backgroundColor: '#4CAF50' }]}>
          <Card.Content style={styles.metricContent}>
            <Text variant="displaySmall" style={styles.metricNumber}>
              {metrics.activeProperties}
            </Text>
            <Text style={styles.metricLabel}>Aktif İlan</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.metricCard, { backgroundColor: '#2196F3' }]}>
          <Card.Content style={styles.metricContent}>
            <Text variant="displaySmall" style={styles.metricNumber}>
              {metrics.pendingProperties}
            </Text>
            <Text style={styles.metricLabel}>Görüşülen</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.metricCard, { backgroundColor: '#FF9800' }]}>
          <Card.Content style={styles.metricContent}>
            <Text variant="displaySmall" style={styles.metricNumber}>
              {metrics.soldThisMonth}
            </Text>
            <Text style={styles.metricLabel}>Bu Ay Satılan</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.metricCard, { backgroundColor: '#9C27B0' }]}>
          <Card.Content style={styles.metricContent}>
            <Text variant="displaySmall" style={styles.metricNumber}>
              {metrics.upcomingReminders}
            </Text>
            <Text style={styles.metricLabel}>Hatırlatma</Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.card}>
        <Card.Title
          title="Bu Ayki Kazanç"
          subtitle={formatPrice(metrics.totalCommission)}
          left={(props) => <List.Icon {...props} icon="cash-multiple" />}
        />
      </Card>

      <Card style={styles.card}>
        <Card.Title
          title="Son Satışlar"
          subtitle="Son 5 satış"
          left={(props) => <List.Icon {...props} icon="sale" />}
          right={(props) => (
            <IconButton
              {...props}
              icon="arrow-right"
              onPress={() => router.push('/trades')}
            />
          )}
        />
        <Card.Content>
          {recentSales.length === 0 ? (
            <Text style={styles.emptyText}>Henüz satış kaydı yok</Text>
          ) : (
            recentSales.map((sale, index) => (
              <React.Fragment key={sale.date}>
                {index > 0 && <Divider style={styles.divider} />}
                <TouchableRipple
                  onPress={() => router.push(`/trade/${sale.tradeId}`)}
                >
                  <List.Item
                    title={sale.propertyTitle}
                    description={`${formatPrice(sale.price)} • ${formatDate(
                      sale.date
                    )}`}
                    left={(props) => <List.Icon {...props} icon="home" />}
                    right={(props) => (
                      <View style={styles.saleInfo}>
                        <Text>{formatPrice(sale.commission)}</Text>
                        <Text style={styles.commissionRate}>
                          %{sale.commissionRate}
                        </Text>
                      </View>
                    )}
                  />
                </TouchableRipple>
              </React.Fragment>
            ))
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title
          title="Yaklaşan Hatırlatmalar"
          subtitle="Önümüzdeki 5 hatırlatma"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={(props) => (
            <IconButton
              {...props}
              icon="arrow-right"
              onPress={() => router.push('/communications')}
            />
          )}
        />
        <Card.Content>
          {upcomingReminders.length === 0 ? (
            <Text style={styles.emptyText}>Yaklaşan hatırlatma yok</Text>
          ) : (
            upcomingReminders.map((comm, index) => (
              <React.Fragment key={comm.id}>
                {index > 0 && <Divider style={styles.divider} />}
                <TouchableRipple
                  onPress={() => router.push(`/communication/${comm.id}`)}
                >
                  <List.Item
                    title={comm.customerName}
                    description={`${formatDate(comm.reminder!.date)} • ${
                      comm.reminder!.notes
                    }`}
                    left={(props) => <List.Icon {...props} icon="bell-ring" />}
                  />
                </TouchableRipple>
              </React.Fragment>
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    padding: 16,
    paddingBottom: 8,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    marginBottom: 12,
    elevation: 4,
    borderRadius: 12,
  },
  metricContent: {
    padding: 4,
    alignItems: 'center',
  },
  metricNumber: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 4,
  },
  metricLabel: {
    color: 'white',
    fontSize: 16,
    marginTop: 4,
    marginBottom: 4,
    textAlign: 'center',
  },
  card: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  divider: {
    marginVertical: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    padding: 16,
  },
  saleInfo: {
    alignItems: 'flex-end',
  },
  commissionRate: {
    fontSize: 12,
    color: '#666',
  },
});
