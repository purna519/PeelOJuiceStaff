import React, {createContext, useState, useEffect, useContext} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {login as loginAPI} from '../services/auth';

const AuthContext = createContext({});

export const AuthProvider = ({children}) => {
  const [staff, setStaff] = useState(null);
  const [branch, setBranch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    try {
      const [accessToken, staffData, branchData] = await AsyncStorage.multiGet([
        'accessToken',
        'staff',
        'branch',
      ]);

      if (accessToken[1] && staffData[1] && branchData[1]) {
        setStaff(JSON.parse(staffData[1]));
        setBranch(JSON.parse(branchData[1]));
      }
    } catch (error) {
      console.error('Error loading staff data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await loginAPI(email, password);

      // Extract data from response
      const {access_token, refresh_token, user: userData} = response;

      // Check if user is staff
      if (!userData.is_staff) {
        return {
          success: false,
          message: 'This app is for staff members only. Please use the customer app.',
        };
      }

      // Check if staff has assigned branch
      if (!userData.assigned_branch) {
        return {
          success: false,
          message: 'No branch assigned. Please contact administrator.',
        };
      }

      // Store data including branch
      await AsyncStorage.multiSet([
        ['accessToken', access_token],
        ['refreshToken', refresh_token],
        ['staff', JSON.stringify(userData)],
        ['branch', JSON.stringify(userData.assigned_branch)],
      ]);

      setStaff(userData);
      setBranch(userData.assigned_branch);

      return {success: true};
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || error.response?.data?.message || 'Login failed',
      };
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['accessToken', 'staff', 'branch']);
    setStaff(null);
    setBranch(null);
  };

  return (
    <AuthContext.Provider
      value={{
        staff,
        branch,
        isLoading,
        isAuthenticated: !!staff,
        login,
        logout,
        loadStaffData,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
