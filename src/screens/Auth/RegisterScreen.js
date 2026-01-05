import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {register} from '../../services/auth';
import CustomDialog from '../../components/CustomDialog';
import {COLORS} from '../../utils/constants';

const RegisterScreen = ({navigation}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({});

  const handleRegister = async () => {
    // Validation
    if (!firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword) {
      setDialogConfig({
        title: 'Error',
        message: 'Please fill in all fields',
        type: 'error',
        confirmText: 'OK',
      });
      setDialogVisible(true);
      return;
    }

    if (password !== confirmPassword) {
      setDialogConfig({
        title: 'Error',
        message: 'Passwords do not match',
        type: 'error',
        confirmText: 'OK',
      });
      setDialogVisible(true);
      return;
    }

    if (password.length < 6) {
      setDialogConfig({
        title: 'Error',
        message: 'Password must be at least 6 characters',
        type: 'error',
        confirmText: 'OK',
      });
      setDialogVisible(true);
      return;
    }

    setLoading(true);
    try {
      const response = await register(email, phoneNumber, password, confirmPassword, firstName, lastName);
      setLoading(false);
      setDialogConfig({
        title: 'Success',
        message: 'Registration successful! Please verify your email with the OTP sent.',
        type: 'success',
        confirmText: 'OK',
      });
      setDialogVisible(true);
      // Navigate to OTP screen after closing dialog
      setTimeout(() => {
        navigation.navigate('OTP', {email});
      }, 500);
    } catch (error) {
      setLoading(false);
      const errorMsg = 
        error.response?.data?.error ||
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        'An error occurred during registration';
      setDialogConfig({
        title: 'Registration Failed',
        message: errorMsg,
        type: 'error',
        confirmText: 'OK',
      });
      setDialogVisible(true);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Create Staff Account</Text>
        <Text style={styles.subtitle}>Join PeelOJuice Staff Portal!</Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#999"
          value={firstName}
          onChangeText={setFirstName}
        />

        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#999"
          value={lastName}
          onChangeText={setLastName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#999"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#999"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkTextBold}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <CustomDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        {...dialogConfig}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: COLORS.text,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
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

export default RegisterScreen;
