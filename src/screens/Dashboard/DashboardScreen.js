import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {useAuth} from '../../contexts/AuthContext';
import {getOrders} from '../../services/orders';
import {COLORS, STATUS_DISPLAY} from '../../utils/constants';

const DashboardScreen = ({navigation}) => {
  const {branch, staff} = useAuth();
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
      const ordersList = Array.isArray(orders) ? orders : [];

      // Calculate stats
      const statsData = {
        total: ordersList.length,
        pending: ordersList.filter(o => o.status === 'pending').length,
        preparing: ordersList.filter(o => o.status === 'preparing').length,
        outForDelivery: ordersList.filter(o => o.status === 'out_for_delivery').length,
      };

      setStats(statsData);
      setRecentOrders(ordersList.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({total: 0, pending: 0, preparing: 0, outForDelivery: 0});
      setRecentOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const getStatusColor = status => {
    const colors = {
      pending: '#FFA500',
      confirmed: '#2196F3',
      preparing: '#9C27B0',
      out_for_delivery: '#FF6B35',
      delivered: '#4CAF50',
      cancelled: '#F44336',
    };
    return colors[status] || '#666';
  };

  const renderStatCard = (title, value, icon, gradient) => (
    <LinearGradient
      colors={gradient}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <Icon name={icon} size={28} color="#fff" />
      </View>
      <Text style={styles.statNumber}>{value || 0}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </LinearGradient>
  );

  const renderOrderItem = ({item}) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('Orders', {
        screen: 'OrderDetail',
        params: {orderId: item.id}
      })}
      activeOpacity={0.7}>
      <View style={styles.orderLeft}>
        <View style={styles.orderIconContainer}>
          <Icon name="receipt-outline" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>#{item.order_number}</Text>
          <Text style={styles.orderCustomer}>{item.user?.full_name}</Text>
          <Text style={styles.orderTime}>
            {new Date(item.created_at).toLocaleString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
      <View style={styles.orderRight}>
        <Text style={styles.orderAmount}>₹{item.total_amount}</Text>
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
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
      }>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#FF6B35', '#FF8C61']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Welcome Back!</Text>
            <Text style={styles.staffName}>
              {staff?.full_name || 'Staff Member'}
            </Text>
            {branch?.name && (
              <View style={styles.branchContainer}>
                <Icon name="location" size={14} color="#FFE8E0" />
                <Text style={styles.branchText}>
                  {branch.name} - {branch.city}
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          {renderStatCard('Total Orders', stats.total, 'receipt', ['#FF6B35', '#FF8C61'])}
          {renderStatCard('Pending', stats.pending, 'time', ['#FFA500', '#FFB84D'])}
        </View>
        <View style={styles.statsRow}>
          {renderStatCard('Preparing', stats.preparing, 'restaurant', ['#9C27B0', '#BA55D3'])}
          {renderStatCard('Out for Delivery', stats.outForDelivery, 'bicycle', ['#2196F3', '#42A5F5'])}
        </View>
      </View>

      {/* Recent Orders Section */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="time-outline" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Recent Orders</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentOrders.length > 0 ? (
          <View>
            {recentOrders.map((item, index) => (
              <View key={item.id}>
                {renderOrderItem({item})}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="cart-outline" size={64} color="#DDD" />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptyText}>
              Orders for your branch will appear here
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#FF6B35',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#FFE8E0',
    marginBottom: 4,
  },
  staffName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  branchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  branchText: {
    fontSize: 13,
    color: '#FFE8E0',
    marginLeft: 4,
    fontWeight: '500',
  },
  statsContainer: {
    padding: 16,
    marginTop: -10,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  recentSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  orderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  orderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  orderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  orderCustomer: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  orderTime: {
    fontSize: 12,
    color: '#999',
  },
  orderRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default DashboardScreen;
