import React, { useState } from 'react';
import {
  View, Text, TextInput, Button,
  StyleSheet, TouchableOpacity, Alert, Platform,
} from 'react-native';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    if (!username.trim()) {
      showAlert('Validation Error', 'Username is required');
    } else if (!passwordRegex.test(password)) {
      showAlert(
        'Invalid Password',
        'Password must contain:\n- Min 8 characters\n- 1 uppercase\n- 1 lowercase\n- 1 number\n- 1 special character'
      );
    } else {
      try {
        const response = await fetch('http://192.168.169.225:5000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
          showAlert('Success', data.message);
          // navigation.navigate('Dashboard'); // Uncomment if you have a dashboard screen
        } else {
          showAlert('Error', data.message || 'Login failed');
        }
      } catch (error) {
        showAlert('Network Error', 'Could not connect to the server');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={handleLogin} color="#841584" />

      <TouchableOpacity
        onPress={() => {
          console.log('Navigating to Signup');
          navigation.navigate('Signup');
        }}
      >
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fdf6ff' },
  title: { fontSize: 26, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    marginVertical: 10,
    padding: 12,
    borderRadius: 8,
    borderColor: '#aaa',
    backgroundColor: '#fff',
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: '#841584',
    textDecorationLine: 'underline',
  },
});
