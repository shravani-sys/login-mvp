import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import PopupAlert from './PopupAlert';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('default');
  const [buttonText, setButtonText] = useState('OK');

  const showAlert = (title, message, type = 'default', btnText = 'OK') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setButtonText(btnText);
    setAlertVisible(true);
  };

  const handleLogin = async () => {
    if (!username.trim()) return showAlert('Validation Error', 'Username is required', 'error', 'Try Again');
    if (password.length < 6) return showAlert('Validation Error', 'Password must be at least 6 characters', 'warning', 'OK');

    try {
      const response = await fetch('http://192.168.106.225:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Login successful");
        showAlert('Success', data.message, 'success', 'Continue');
        setTimeout(() => {
          setAlertVisible(false);
          navigation.navigate('Dashboard');
        }, 1000);
      } else {
        showAlert('Login Failed', data.message || 'Invalid credentials', 'error', 'Try Again');
      }
    } catch (err) {
      console.error(err);
      showAlert('Network Error', 'Unable to connect to the server.', 'error', 'Retry');
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

      <PopupAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        type={alertType}
        buttonText={buttonText}
        width={320} 
        height={190}   
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
