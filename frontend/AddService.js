import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function AddService({ services, setServices }) {
  const navigation = useNavigation();

  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [staff, setStaff] = useState('');
  const [image, setImage] = useState(null);

  const handleSave = () => {
    if (!serviceName.trim() || !price.trim()) {
      alert('Please fill in required fields.');
      return;
    }

    const newService = {
      id: Date.now().toString(),
      title: serviceName,
      category,
      duration,
      price,
      description,
      staff,
      image,
    };

    setServices([...services, newService]);
    navigation.goBack();
  };

  const handleImageUpload = () => {
    setImage('https://via.placeholder.com/300'); // Placeholder
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Service Name</Text>
      <TextInput
        style={styles.input}
        value={serviceName}
        onChangeText={setServiceName}
        placeholder="Enter service name"
      />

      <Text style={styles.label}>Category</Text>
      <TextInput
        style={styles.input}
        value={category}
        onChangeText={setCategory}
        placeholder="Enter category"
      />

      <Text style={styles.label}>Duration (minutes)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={duration}
        onChangeText={setDuration}
        placeholder="Enter duration"
      />

      <Text style={styles.label}>Price ($)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
        placeholder="Enter price"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
      />

      <Text style={styles.label}>Service Image</Text>
      {image && (
        <Image source={{ uri: image }} style={styles.image} />
      )}
      <TouchableOpacity style={styles.uploadButton} onPress={handleImageUpload}>
        <Text style={styles.uploadButtonText}>Upload & Modify</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Staff Handling Service</Text>
      <TextInput
        style={styles.input}
        value={staff}
        onChangeText={setStaff}
        placeholder="Select staff"
      />

      <TouchableOpacity style={styles.addButton} onPress={handleSave}>
        <Text style={styles.addButtonText}>Add Service</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 5
  },
  uploadButton: {
    backgroundColor: '#6C3483',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center'
  },
  uploadButtonText: { color: '#fff', fontWeight: 'bold' },
  image: { width: '100%', height: 150, borderRadius: 8, marginTop: 10 },
  addButton: {
    backgroundColor: '#6C3483',
    padding: 15,
    borderRadius: 8,
    marginTop: 25,
    alignItems: 'center'
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
