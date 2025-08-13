import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ManageServicesScreen({ services, setServices }) {
  const navigation = useNavigation();

  const handleDelete = (id) => {
    setServices(services.filter(service => service.id !== id));
  };

  const renderService = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddService')}
      >
        <Text style={styles.addButtonText}>Add Service</Text>
      </TouchableOpacity>
      <FlatList
        data={services}
        keyExtractor={item => item.id}
        renderItem={renderService}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  addButton: {
    backgroundColor: '#6C3483',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'flex-end',
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  description: { fontSize: 14, color: '#555', marginBottom: 10 },
  buttons: { flexDirection: 'row', gap: 10 },
  editButton: { backgroundColor: '#6C3483', padding: 8, borderRadius: 6 },
  deleteButton: { backgroundColor: 'red', padding: 8, borderRadius: 6 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
