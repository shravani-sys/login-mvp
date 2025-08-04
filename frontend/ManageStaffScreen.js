import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function ManageStaffScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Manage Staff</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AddStaff')}
      >
        <FontAwesome5 name="user-plus" size={30} color="#4CAF50" />
        <Text style={styles.cardText}>Add Staff</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DeleteStaff')}
      >
        <MaterialIcons name="delete" size={30} color="#F44336" />
        <Text style={styles.cardText}>Delete Staff</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ViewStaff')}
      >
        <Ionicons name="document-text-outline" size={30} color="#2196F3" />
        <Text style={styles.cardText}>View Staff Info</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    paddingTop: 60,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  card: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 20,
  },
  cardText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#444',
  },
});
