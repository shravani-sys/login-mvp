import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';

const API_URL = 'http://10.160.95.225:5000/api/staff';


export default function ViewStaffScreen() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setStaffList(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching staff:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6a0dad" />
      </View>
    );
  }

  if (!staffList.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No staff added yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.listContainer}>
      {staffList.map((staff, index) => (
        <View key={index} style={styles.card}>
          <Image
            source={{
              uri: staff.photo || 'https://via.placeholder.com/100',
            }}
            style={styles.image}
          />
          <View style={styles.info}>
            <Text style={styles.name}>{staff.name}</Text>
            <Text>Phone: {staff.phone}</Text>
            <Text>DOB: {staff.dob}</Text>
            <Text>Joined: {staff.joiningDate}</Text>
            <Text>Gender: {staff.gender}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  listContainer: {
    padding: 12,
    backgroundColor: '#f5f5f5',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#6a0dad',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5e3b76',
    marginBottom: 4,
  },
});
