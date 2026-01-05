import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {verifyPasswordResetOTP, confirmPasswordReset} from '../../services/auth';
import CustomDialog from '../../components/CustomDialog';
import {COLORS} from '../../utils/constants';

const ResetPasswordScreen = ({navigation, route}) => {
  const {emailOrPhone} = route.params || {};
  
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({});

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setDialogConfig({
        title: 'Error',
        message: 'Please enter the OTP',
        type: 'error',
        confirmText: 'OK',
      });
      setDialogVisible(true);
      return;
    }

    setLoading(true);
    try {
      const response = await verifyPasswordResetOTP(emailOrPhone, otp.trim());
      setLoading(false);
      setOtpVerified(true);
      setDialogConfig({
        title: 'Success',
        message: response.message || 'OTP verified successfully',
        type: 'success',
        confirmText: 'OK',
      });
      setDialogVisible(true);
    } catch (error) {
      setLoading(false);
      const errorMessage =
        error.response?.data?.message || 'Invalid OTP. Please try again.';
      setDialogConfig({
        title: 'Error',
        message: errorMessage,
        type: 'error',
        confirmText: 'OK',
      });
      setDialogVisible(true);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      setDialogConfig({
        title: 'Error',
        message: 'Please enter a new password',
        type: 'error',
        confirmText: 'OK',
      });
      setDialogVisible(true);
      return;
    }

    if (newPassword.length < 8) {
      setDialogConfig({
        title: 'Error',
        message: 'Password must be at least 8 characters',
        type: 'error',
        confirmText: 'OK',
      });
      setDialogVisible(true);
      return;
    }

    setLoading(true);
    try {
      const response = await confirmPasswordReset(emailOrPhone, newPassword);
      setLoading(false);
      
      setDialogConfig({
        title: 'Success',
        message: response.message || 'Password reset successful. Please login with your new password',
        type: 'success',
        confirmText: 'OK',
      });
      setDialogVisible(true);
      
      setTimeout(() => {
        navigation.navigate('Login');
      }, 500);
    } catch (error) {
      setLoading(false);
      const errorMessage =
        error.response?.data?.message || 'Failed to reset password. Please try again.';
      setDialogConfig({
        title: 'Error',
        message: errorMessage,
        type: 'error',
        confirmText: 'OK',
      });
      setDialogVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          {!otpVerified
            ? 'Enter the OTP sent to your email'
            : 'Enter your new password'}
        </Text>
      </View>

      <View style={styles.form}>
        {!otpVerified ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              placeholderTextColor="#999"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleVerifyOTP}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="New Password (min 8 characters)"
                placeholderTextColor="#999"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.eyeIconText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleResetPassword}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>
            <Text style={styles.linkTextBold}>Back to Login</Text>
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
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#E0E0E0',
    textAlign: 'center',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: 4,
    fontSize: 24,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: COLORS.text,
  },
  eyeIcon: {
    padding: 15,
  },
  eyeIconText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    textAlign: 'center',
    marginTop: 20,
    color: COLORS.textLight,
    fontSize: 14,
  },
  linkTextBold: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default ResetPasswordScreen;
