import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import PopupAlert from './PopupAlert.js'; // adjust path as needed




export default function AddStaffScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [isDobPickerVisible, setDobPickerVisible] = useState(false);
  const [isJoiningDatePickerVisible, setJoiningDatePickerVisible] = useState(false);
  const [gender, setGender] = useState('');
  const [profileImage, setProfileImage] = useState(null);
const [popupVisible, setPopupVisible] = useState(false);
const [popupMessage, setPopupMessage] = useState('');

// ✅ Cross-platform alert function
const showAlert = (title, message) => {
  setPopupMessage(`${title}\n\n${message}`);
  setPopupVisible(true);
};

  const formatDate = (value) => {
    const date = new Date(value);
    return date.toDateString();
  };

  const handleDobConfirm = (date) => {
    setDob(formatDate(date));
    setDobPickerVisible(false);
  };

  const handleJoiningDateConfirm = (date) => {
    setJoiningDate(formatDate(date));
    setJoiningDatePickerVisible(false);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
  if (!name || !phone || !address || !dob || !joiningDate || !gender) {
    showAlert('Error', 'Please fill all fields.');
    return;
  }

  if (!/^\d{10}$/.test(phone)) {
    showAlert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
    return;
  }

  const payload = {
    name,
    phone,
    dob,
    joiningDate,
    gender,
    photo: profileImage || null,
  };

  try {
    const response = await fetch('http://10.21.202.225:5000/api/staff', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      showAlert('Success', 'Staff Added Successfully!');
      console.log('Server response:', data);

      // Clear form
      setName('');
      setPhone('');
      setAddress('');
      setDob('');
      setJoiningDate('');
      setGender('');
      setProfileImage(null);
    } else {
      showAlert('Error', data.message || 'Failed to add staff.');
    }
  } catch (error) {
    console.error('Error adding staff:', error);
    showAlert('Error', 'Something went wrong.');
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Add Staff Member</Text>

      {/* Profile Image Picker */}
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="person-circle-outline" size={80} color="#aaa" />
            <Text style={styles.imageText}>Upload Profile Picture</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        maxLength={10}
      />

      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />

      {/* DOB */}
      <Text style={styles.label}>Date of Birth</Text>
      {Platform.OS === 'web' ? (
        <input
          type="date"
          className="web-date"
          style={styles.webDate}
          value={dob ? new Date(dob).toISOString().split('T')[0] : ''}
          onChange={(e) => setDob(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
      ) : (
        <>
          <TouchableOpacity style={styles.input} onPress={() => setDobPickerVisible(true)}>
            <Text style={{ color: dob ? '#000' : '#999' }}>
              {dob || 'Select Date of Birth'}
            </Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDobPickerVisible}
            mode="date"
            onConfirm={handleDobConfirm}
            onCancel={() => setDobPickerVisible(false)}
          />
        </>
      )}

      {/* Joining Date */}
      <Text style={styles.label}>Joining Date</Text>
      {Platform.OS === 'web' ? (
        <input
          type="date"
          className="web-date"
          style={styles.webDate}
          value={joiningDate ? new Date(joiningDate).toISOString().split('T')[0] : ''}
          onChange={(e) => setJoiningDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
      ) : (
        <>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setJoiningDatePickerVisible(true)}
          >
            <Text style={{ color: joiningDate ? '#000' : '#999' }}>
              {joiningDate || 'Select Joining Date'}
            </Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isJoiningDatePickerVisible}
            mode="date"
            onConfirm={handleJoiningDateConfirm}
            onCancel={() => setJoiningDatePickerVisible(false)}
          />
        </>
      )}

      {/* Gender Picker */}
      <Text style={styles.label}>Gender</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={gender}
          onValueChange={(value) => setGender(value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Gender" value="" color="#aaa" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
          <Picker.Item label="Other" value="other" />
        </Picker>
      </View>

      {/* Submit */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Add Staff</Text>
      </TouchableOpacity>

       <PopupAlert
           visible={popupVisible}
           message={popupMessage}
           onClose={() => setPopupVisible(false)}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f9f9ff',
    minHeight: '100%',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    color: '#5e3b76',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    width: '100%',
  },
  label: {
    alignSelf: 'flex-start',
    marginTop: 12,
    marginBottom: 4,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
    marginBottom: 16,
    width: '100%',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#6a0dad',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  webDate: {
    padding: 12,
    borderRadius: 12,
    border: '1px solid #ccc',
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
    width: '100%',
  },
  imageContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#6a0dad',
  },
  placeholder: {
    alignItems: 'center',
  },
  imageText: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
});
