import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {verifyOTP, resendOTP} from '../../services/auth';
import {useAuth} from '../../contexts/AuthContext';
import CustomDialog from '../../components/CustomDialog';
import {COLORS} from '../../utils/constants';

const OTPScreen = ({route, navigation}) => {
  const {email} = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({});
  const {loadStaffData} = useAuth();

  // Countdown timer for resend OTP
  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setDialogConfig({
        title: 'Error',
        message: 'Please enter a valid 6-digit OTP',
        type: 'error',
        confirmText: 'OK',
      });
      setDialogVisible(true);
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOTP(email, otp);
      
      // Save tokens
      if (response.access && response.refresh) {
        await AsyncStorage.multiSet([
          ['accessToken', response.access],
          ['refreshToken', response.refresh],
          ['staff', JSON.stringify(response.user)],
        ]);
        
        // Check if user is staff
        if (response.user?.is_staff && response.user?.assigned_branch) {
          await AsyncStorage.setItem('branch', JSON.stringify(response.user.assigned_branch));
        }
        
        await loadStaffData();
      }
      
      setLoading(false);
      setDialogConfig({
        title: 'Success',
        message: 'Account verified successfully!',
        type: 'success',
        confirmText: 'OK',
      });
      setDialogVisible(true);
      // Navigation will happen automatically via AuthContext
    } catch (error) {
      setLoading(false);
      setDialogConfig({
        title: 'Verification Failed',
        message: error.response?.data?.message || 'Invalid OTP',
        type: 'error',
        confirmText: 'OK',
      });
      setDialogVisible(true);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      await resendOTP(email);
      setDialogConfig({
        title: 'Success',
        message: 'OTP sent successfully!',
        type: 'success',
        confirmText: 'OK',
      });
      setDialogVisible(true);
      setResendTimer(60);
      setCanResend(false);
    } catch (error) {
      setDialogConfig({
        title: 'Error',
        message: 'Failed to resend OTP',
        type: 'error',
        confirmText: 'OK',
      });
      setDialogVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        <TextInput
          style={styles.otpInput}
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
        />

        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerifyOTP}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResendOTP}
          disabled={!canResend}
          style={styles.resendButton}>
          <Text
            style={[
              styles.resendText,
              {color: canResend ? COLORS.primary : '#999'},
            ]}>
            {canResend
              ? 'Resend OTP'
              : `Resend OTP in ${resendTimer}s`}
          </Text>
        </TouchableOpacity>
      </View>

      <CustomDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        {...dialogConfig}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 40,
    textAlign: 'center',
  },
  email: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  otpInput: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: 20,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 10,
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OTPScreen;
