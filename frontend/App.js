import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleSubmit = async () => {
    if (!username.trim()) {
      Alert.alert('Validation Error', 'Username is required');
    } else if (!passwordRegex.test(password)) {
      Alert.alert(
        'Invalid Password',
        'Password must have:\n- Min 8 characters\n- 1 uppercase\n- 1 lowercase\n- 1 number\n- 1 special character'
      );
    } else {
      try {
        const endpoint = isSignup ? 'signup' : 'login';
        const response = await fetch(`http://10.0.2.2:5000/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
          Alert.alert('Success', data.message);
        } else {
          Alert.alert('Error', data.message || 'Something went wrong');
        }
      } catch (error) {
        Alert.alert('Network Error', 'Could not connect to server');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{isSignup ? 'Sign Up' : 'Login'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={setUsername}
        value={username}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <Button title={isSignup ? 'Sign Up' : 'Login'} onPress={handleSubmit} color="#841584" />

      <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
        <Text style={styles.toggle}>
          {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf6ff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    width: '90%',
    padding: 12,
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  toggle: {
    marginTop: 12,
    color: '#841584',
    textDecorationLine: 'underline',
  },
});
