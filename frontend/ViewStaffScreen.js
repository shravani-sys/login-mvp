import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

const API_URL = 'http://192.168.106.225:5000/api/staff';

export default function ViewStaffScreen() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStaff = async () => {
    try {
      console.log('Fetching staff from:', API_URL);
      const response = await fetch(API_URL);
      const data = await response.json();

      console.log('Raw staff data from API:', data);

      if (response.ok) {
        // Fix: use data.staff if backend returns { success: true, staff: [...] }
        setStaffList(Array.isArray(data.staff) ? data.staff : []);
      } else {
        console.error('API Error:', data.message);
        setStaffList([]);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaffList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStaff();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6a0dad" />
        <Text style={styles.loadingText}>Loading staff...</Text>
      </View>
    );
  }

  if (!staffList.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No staff members found.</Text>
        <Text style={styles.emptySubtext}>Add staff members to see them here.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.listContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.header}>Staff Members ({staffList.length})</Text>

      {staffList.map((staff, index) => (
        <View key={staff.id || index} style={styles.card}>
          <Image
            source={{
              uri: staff.profile_picture || staff.photo || 'https://via.placeholder.com/100',
            }}
            style={styles.image}
            onError={(error) => console.log('Image load error:', error)}
          />
          <View style={styles.info}>
            <Text style={styles.name}>{staff.full_name || staff.name || 'No Name'}</Text>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{staff.phone_number || staff.phone || 'N/A'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>DOB:</Text>
              <Text style={styles.value}>{formatDate(staff.date_of_birth || staff.dob)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Joined:</Text>
              <Text style={styles.value}>{formatDate(staff.joining_date || staff.joiningDate)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Gender:</Text>
              <Text style={styles.value}>{staff.gender || 'N/A'}</Text>
            </View>

            {staff.address && (
              <View style={styles.detailRow}>
                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value} numberOfLines={2}>
                  {staff.address}
                </Text>
              </View>
            )}
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
    backgroundColor: '#f9f9ff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5e3b76',
    marginBottom: 16,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
    backgroundColor: '#f9f9ff',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#6a0dad',
    backgroundColor: '#f5f5f5',
  },
  info: {
    flex: 1,
    justifyContent: 'space-around',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5e3b76',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 60,
    marginRight: 8,
  },
  value: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textTransform: 'capitalize',
  },
});
