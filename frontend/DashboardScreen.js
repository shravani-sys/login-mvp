import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function DashboardScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://192.168.106.225:5000/api/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Info card component
  const InfoCard = ({ title, value, icon, onPress }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.cardIconContainer}>
          {icon}
          {onPress && (
            <Ionicons name="chevron-forward" size={16} color="#6C3483" style={styles.chevronIcon} />
          )}
        </View>
      </View>
      <Text style={styles.cardValue}>{value}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6C3483" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with title + notification bell */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>SalonAdmin Dashboard</Text>
        <TouchableOpacity 
          style={styles.notificationButton} 
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={28} color="#6C3483" />
        </TouchableOpacity>
      </View>

      {/* Dashboard cards */}
      <InfoCard
        title="Total Appointments"
        value={data.totalAppointments}
        icon={<Ionicons name="calendar" size={20} color="#6C3483" />}
        onPress={() => navigation.navigate('Calendar')}
      />
      
      <InfoCard
        title="Revenue Generated"
        value={`₹${data.revenueGenerated}`}
        icon={<FontAwesome5 name="rupee-sign" size={18} color="#6C3483" />}
      />
      
      <InfoCard
        title="Upcoming Appointments"
        value={data.upcomingAppointments}
        icon={<Ionicons name="time" size={20} color="#6C3483" />}
        onPress={() => navigation.navigate('Calendar')}
      />
      
      <InfoCard
        title="Ongoing Ad Campaigns"
        value={data.ongoingAdCampaigns}
        icon={<MaterialIcons name="campaign" size={20} color="#6C3483" />}
      />
      
      <InfoCard
        title="Current Promotions"
        value={data.currentPromotions}
        icon={<MaterialIcons name="local-offer" size={20} color="#6C3483" />}
      />

      {/* Quick links */}
      <Text style={styles.quickLinksTitle}>Quick Links</Text>
      <View style={styles.linksContainer}>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('ManageAppointments')}
        >
          <Text style={styles.linkText}>Manage Appointments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('ManageStaff')}>
          <Text style={styles.linkText}>Manage Staff</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('ManageServices')}>
          <Text style={styles.linkText}>Manage Services</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Manage Promotions</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    marginVertical: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#6C3483',
    flex: 1,
  },
  card: {
    backgroundColor: '#EAD4FF',
    padding: 20,
    borderRadius: 12,
    marginVertical: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevronIcon: {
    marginLeft: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#000',
  },
  quickLinksTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6C3483',
  },
  linksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  linkButton: {
    backgroundColor: '#6C3483',
    padding: 12,
    borderRadius: 8,
    width: '48%',
    marginVertical: 6,
  },
  linkText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
