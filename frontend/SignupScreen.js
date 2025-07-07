import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Button,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

export default function SignupScreen({ navigation }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    address: '',
    phoneNumber: '',
    dob: '',
    department: '',
    employeeId: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const backendUrl = 'http://192.168.169.225:5000/signup';

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const onDOBChange = (_event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const iso = selectedDate.toISOString().split('T')[0];
      setFormData({ ...formData, dob: iso });
    }
  };

  const handleSignup = async () => {
    const {
      username,
      password,
      confirmPassword,
      firstName,
      lastName,
      email,
      address,
      phoneNumber,
      dob,
      department,
      employeeId,
    } = formData;

    if (
      !username || !password || !confirmPassword || !firstName || !lastName ||
      !email || !address || !phoneNumber || !dob || !department || !employeeId
    ) {
      showAlert('Validation Error', 'Please fill all the fields.');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Validation Error', 'Passwords do not match.');
      return;
    }

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Signup response data:', data);

      if (response.ok) {
        showAlert('Success', data.message);
        navigation.navigate('Login');
      } else {
        showAlert('Error', data.message || 'Signup failed.');
      }
    } catch (error) {
      console.error('Signup Error:', error);
      showAlert('Network Error', 'Could not reach the server.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>

        {[
          ['First Name', 'firstName'],
          ['Last Name', 'lastName'],
          ['Username', 'username'],
          ['Password', 'password'],
          ['Confirm Password', 'confirmPassword'],
          ['Email', 'email'],
          ['Address', 'address'],
          ['Phone Number', 'phoneNumber'],
          ['Employee ID', 'employeeId'],
        ].map(([label, key]) => (
          <TextInput
            key={key}
            style={styles.input}
            placeholder={label}
            secureTextEntry={key.toLowerCase().includes('password')}
            keyboardType={key === 'phoneNumber' ? 'numeric' : 'default'}
            value={formData[key]}
            onChangeText={(text) => setFormData({ ...formData, [key]: text })}
            placeholderTextColor="#aaa"
          />
        ))}

        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text style={{ color: formData.dob ? '#000' : '#999' }}>
            {formData.dob || 'Select Date of Birth'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={formData.dob ? new Date(formData.dob) : new Date()}
            mode="date"
            display="default"
            onChange={onDOBChange}
          />
        )}

        <Picker
          selectedValue={formData.department}
          style={styles.input}
          dropdownIconColor="#6a1b9a"
          onValueChange={(val) => setFormData({ ...formData, department: val })}
        >
          <Picker.Item label="Select Department" value="" />
          <Picker.Item label="CSE" value="CSE" />
          <Picker.Item label="IT" value="IT" />
          <Picker.Item label="ECE" value="ECE" />
          <Picker.Item label="MECH" value="MECH" />
        </Picker>

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? Log In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f5ebff',
  },
  container: {
    padding: 24,
    paddingTop: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    color: '#4a148c',
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#d1c4e9',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  button: {
    backgroundColor: '#6a1b9a',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 16,
    shadowColor: '#6a1b9a',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: '#6a1b9a',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
