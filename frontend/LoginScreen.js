import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import PopupAlert from './PopupAlert'; // ✅ Import your new component

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleLogin = async () => {
    if (!username.trim()) return showAlert('Validation Error', 'Username is required');
    if (password.length < 6) return showAlert('Validation Error', 'Password must be at least 6 characters');

    try {
      const response = await fetch('http://10.21.202.225:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Login successful");
        showAlert('Success', data.message);
        setTimeout(() => {
          setAlertVisible(false);
          navigation.navigate('Dashboard');
        }, 1000);
      } else {
        showAlert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      showAlert('Network Error', 'Unable to connect to the server.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Login" onPress={handleLogin} color="#6a1b9a" />
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      {/* 🔔 Include the PopupAlert component */}
      <PopupAlert
        title={alertTitle}
        message={alertMessage}
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
      />
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
