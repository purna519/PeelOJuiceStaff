import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../contexts/AuthContext';
import {COLORS} from '../utils/constants';

// Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import OTPScreen from '../screens/Auth/OTPScreen';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import OrdersListScreen from '../screens/Orders/OrdersListScreen';
import OrderDetailScreen from '../screens/Orders/OrderDetailScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const OrdersStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {backgroundColor: COLORS.secondary},
      headerTintColor: '#FFF',
      headerTitleStyle: {fontWeight: 'bold'},
    }}>
    <Stack.Screen
      name="OrdersList"
      component={OrdersListScreen}
      options={{title: 'Orders'}}
    />
    <Stack.Screen
      name="OrderDetail"
      component={OrderDetailScreen}
      options={{title: 'Order Details'}}
    />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      tabBarIcon: ({focused, color, size}) => {
        let iconName;
        if (route.name === 'Dashboard') {
          iconName = focused ? 'stats-chart' : 'stats-chart-outline';
        } else if (route.name === 'Orders') {
          iconName = focused ? 'list' : 'list-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: '#888',
      tabBarStyle: {
        backgroundColor: '#FFF',
        borderTopColor: COLORS.border,
      },
      headerStyle: {backgroundColor: COLORS.secondary},
      headerTintColor: '#FFF',
      headerTitleStyle: {fontWeight: 'bold'},
    })}>
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen
      name="Orders"
      component={OrdersStack}
      options={{headerShown: false}}
    />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const {isAuthenticated, isLoading} = useAuth();

  if (isLoading) {
    return null; // Or a splash screen
  }

  return (
    <NavigationContainer
      onStateChange={(state) => {
        // Don't persist navigation state to prevent auto-navigation issues
        console.log('Navigation state changed:', state);
      }}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{
                headerShown: true,
                headerStyle: {backgroundColor: COLORS.primary},
                headerTintColor: '#FFF',
                headerTitle: 'Create Account',
              }}
            />
            <Stack.Screen 
              name="ForgotPassword" 
              component={ForgotPasswordScreen}
            />
            <Stack.Screen 
              name="OTP" 
              component={OTPScreen}
              options={{
                headerShown: true,
                headerStyle: {backgroundColor: COLORS.primary},
                headerTintColor: '#FFF',
                headerTitle: 'Verify Email',
              }}
            />
            <Stack.Screen 
              name="ResetPassword" 
              component={ResetPasswordScreen}
            />
          </>
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
