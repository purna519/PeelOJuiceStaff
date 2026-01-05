import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {getOrderDetail, updateOrderStatus} from '../../services/orders';
import {COLORS, STATUS_OPTIONS, STATUS_DISPLAY} from '../../utils/constants';

const OrderDetailScreen = ({route, navigation}) => {
  const {orderId} = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!orderId) {
      Alert.alert('Error', 'No order ID provided');
      navigation.goBack();
      return;
    }
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      console.log('Fetching order with ID:', orderId);
      const data = await getOrderDetail(orderId);
      console.log('Order data received:', data);
      setOrder(data);
      setSelectedStatus(data.status);
    } catch (error) {
      console.error('Error fetching order:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      Alert.alert(
        'Error',
        `Failed to load order #${orderId}. ${
          error.response?.status === 404
            ? 'Order not found or not accessible.'
            : 'Please try again.'
        }`,
      );
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (selectedStatus === order.status) {
      Alert.alert('Info', 'Status is already set to this value');
      return;
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      Alert.alert(
        'Cannot Update',
        'Cannot modify delivered or cancelled orders',
      );
      return;
    }

    setUpdating(true);
    try {
      await updateOrderStatus(orderId, selectedStatus);
      Alert.alert('Success', 'Order status updated successfully');
      fetchOrder();
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to update status',
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text>Order not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.orderNumber}>Order #{order.order_number}</Text>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor(order.status)},
          ]}>
          <Text style={styles.statusText}>
            {STATUS_DISPLAY[order.status]}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <Text style={styles.text}>Name: {order.user?.full_name}</Text>
        <Text style={styles.text}>Phone: {order.user?.phone_number}</Text>
        <Text style={styles.text}>Email: {order.user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.items?.map(item => (
          <View key={item.id} style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.juice_name}</Text>
              <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>₹{item.price_per_item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.text}>Payment Method:</Text>
          <Text style={styles.text}>{order.payment?.method || 'COD'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.text}>Created At:</Text>
          <Text style={styles.text}>
            {new Date(order.created_at).toLocaleString()}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalAmount}>₹{order.total_amount}</Text>
        </View>
      </View>

      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedStatus}
              onValueChange={setSelectedStatus}
              style={styles.picker}>
              {STATUS_OPTIONS.map(option => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </View>
          <TouchableOpacity
            style={[styles.button, updating && styles.buttonDisabled]}
            onPress={handleUpdateStatus}
            disabled={updating}>
            {updating ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Update Status</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemQty: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderDetailScreen;
