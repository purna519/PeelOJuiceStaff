import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {useAuth} from '../../contexts/AuthContext';
import {getOrders} from '../../services/orders';
import {COLORS, STATUS_DISPLAY} from '../../utils/constants';

const DashboardScreen = ({navigation}) => {
  const {branch} = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const orders = await getOrders();

      // Calculate stats
      const statsData = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        outForDelivery: orders.filter(o => o.status === 'out_for_delivery')
          .length,
      };

      setStats(statsData);
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const renderOrderItem = ({item}) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', {orderId: item.id})}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>#{item.order_number}</Text>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor(item.status)},
          ]}>
          <Text style={styles.statusText}>
            {STATUS_DISPLAY[item.status]}
          </Text>
        </View>
      </View>
      <Text style={styles.orderCustomer}>{item.user?.full_name}</Text>
      <Text style={styles.orderAmount}>₹{item.total_amount}</Text>
    </TouchableOpacity>
  );

  const getStatusColor = status => {
    const colors = {
      pending: '#FFA500',
      confirmed: '#2196F3',
      preparing: '#9C27B0',
      out_for_delivery: '#FF6B35',
      delivered: '#4CAF50',
    };
    return colors[status] || '#666';
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={() => (
          <>
            <View style={styles.header}>
              <Text style={styles.branchName}>{branch?.name}</Text>
              <Text style={styles.branchAddress}>{branch?.address}</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.statCard, {backgroundColor: '#FF6B35'}]}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total Orders</Text>
              </View>
              <View style={[styles.statCard, {backgroundColor: '#FFA500'}]}>
                <Text style={styles.statNumber}>{stats.pending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={[styles.statCard, {backgroundColor: '#9C27B0'}]}>
                <Text style={styles.statNumber}>{stats.preparing}</Text>
                <Text style={styles.statLabel}>Preparing</Text>
              </View>
              <View style={[styles.statCard, {backgroundColor: '#2196F3'}]}>
                <Text style={styles.statNumber}>{stats.outForDelivery}</Text>
                <Text style={styles.statLabel}>Out for Delivery</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Recent Orders</Text>
          </>
        )}
        data={recentOrders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: COLORS.secondary,
    padding: 20,
    marginBottom: 16,
  },
  branchName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  branchAddress: {
    fontSize: 14,
    color: '#FFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    padding: 16,
    paddingBottom: 8,
  },
  orderCard: {
    backgroundColor: '#FFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  orderCustomer: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default DashboardScreen;
