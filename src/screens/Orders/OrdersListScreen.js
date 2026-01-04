import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {getOrders} from '../../services/orders';
import {COLORS, STATUS_DISPLAY} from '../../utils/constants';

const OrdersListScreen = ({navigation}) => {
  const [tab, setTab] = useState('active');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [tab]);

  const fetchOrders = async () => {
    try {
      const allOrders = await getOrders();

      if (tab === 'active') {
        setOrders(
          allOrders.filter(o =>
            ['pending', 'confirmed', 'preparing'].includes(o.status),
          ),
        );
      } else {
        setOrders(
          allOrders.filter(o =>
            ['out_for_delivery', 'delivered'].includes(o.status),
          ),
        );
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

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
      <Text style={styles.orderPhone}>{item.user?.phone_number}</Text>
      <View style={styles.orderFooter}>
        <Text style={styles.orderAmount}>₹{item.total_amount}</Text>
        <Text style={styles.orderTime}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
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
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'active' && styles.activeTab]}
          onPress={() => setTab('active')}>
          <Text
            style={[
              styles.tabText,
              tab === 'active' && styles.activeTabText,
            ]}>
            Active Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'completed' && styles.activeTab]}
          onPress={() => setTab('completed')}>
          <Text
            style={[
              styles.tabText,
              tab === 'completed' && styles.activeTabText,
            ]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        )}
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.primary,
  },
  orderCard: {
    backgroundColor: '#FFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 18,
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
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  orderPhone: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  orderTime: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
});

export default OrdersListScreen;
