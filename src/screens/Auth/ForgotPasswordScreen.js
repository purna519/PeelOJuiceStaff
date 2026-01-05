import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {requestPasswordReset} from '../../services/auth';
import CustomDialog from '../../components/CustomDialog';
import {COLORS} from '../../utils/constants';

const ForgotPasswordScreen = ({navigation}) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({});

  const handleRequestReset = async () => {
    if (!emailOrPhone.trim()) {
      setDialogConfig({
        title: 'Error',
        message: 'Please enter your email or phone number',
        type: 'error',
        confirmText: 'OK',
      });
      setDialogVisible(true);
      return;
    }

    setLoading(true);
    try {
      const response = await requestPasswordReset(emailOrPhone.trim());
      setLoading(false);
      
      setDialogConfig({
        title: 'OTP Sent',
        message: response.message || 'Password reset OTP has been sent to your email',
        type: 'success',
        confirmText: 'OK',
      });
      setDialogVisible(true);
      
      // Navigate to ResetPassword screen after closing dialog
      setTimeout(() => {
        navigation.navigate('ResetPassword', {
          emailOrPhone: emailOrPhone.trim(),
        });
      }, 500);
    } catch (error) {
      setLoading(false);
      
      // Check if backend returned OTP despite email failure (for testing)
      const errorData = error.response?.data;
      
      if (errorData?.password_reset_otp) {
        // Email failed but OTP was generated - show warning and allow proceeding
        setDialogConfig({
          title: 'Email Delivery Issue',
          message: `${errorData.message}\n\nDo you want to proceed anyway?`,
          type: 'warning',
          confirmText: 'Proceed',
        });
        setDialogVisible(true);
        
        setTimeout(() => {
          navigation.navigate('ResetPassword', {
            emailOrPhone: emailOrPhone.trim(),
          });
        }, 500);
      } else {
        // Complete failure
        const errorMessage =
          errorData?.message || error.message || 'Failed to send reset OTP. Please try again.';
        setDialogConfig({
          title: 'Error',
          message: errorMessage,
          type: 'error',
          confirmText: 'OK',
        });
        setDialogVisible(true);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your email or phone number to receive a password reset OTP
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email or Phone Number"
          placeholderTextColor="#999"
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleRequestReset}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Send OTP</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>
            Remember your password? <Text style={styles.linkTextBold}>Login</Text>
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

export default ForgotPasswordScreen;
