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

      // Validate staff access
      if (!response.is_staff) {
        throw new Error('You do not have staff access');
      }

      if (!response.assigned_branch) {
        throw new Error('No branch assigned. Contact administrator.');
      }

      // Store data
      await AsyncStorage.multiSet([
        ['accessToken', response.access_token],
        ['staff', JSON.stringify(response.user)],
        ['branch', JSON.stringify(response.assigned_branch)],
      ]);

      setStaff(response.user);
      setBranch(response.assigned_branch);

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
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
