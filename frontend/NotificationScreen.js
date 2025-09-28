// NotificationScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';

export default function NotificationScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Ionicons name="options-outline" size={22} color="black" />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Today */}
        <Text style={styles.sectionTitle}>Today</Text>
        <View style={styles.card}>
          <FontAwesome name="heart" size={20} color="black" style={styles.icon} />
          <Text style={styles.cardText}>
            <Text style={styles.bold}>New </Text>
            You have new likes on your
          </Text>
          <Image
            source={{ uri: 'https://placekitten.com/80/80' }}
            style={styles.image}
          />
        </View>

        <View style={styles.card}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/women/1.jpg' }}
            style={styles.avatar}
          />
          <Text style={styles.cardText}>
            <Text style={styles.bold}>New </Text>
            Someone started
          </Text>
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followText}>Follow back</Text>
          </TouchableOpacity>
        </View>

        {/* This week */}
        <Text style={styles.sectionTitle}>This week</Text>
        <View style={styles.card}>
          <MaterialIcons name="chat-bubble-outline" size={20} color="black" style={styles.icon} />
          <Text style={styles.cardText}>
            <Text style={styles.bold}>New </Text>
            Someone commented on
          </Text>
          <Image
            source={{ uri: 'https://placekitten.com/100/100' }}
            style={styles.image}
          />
        </View>

        <View style={styles.card}>
          <Ionicons name="share-social-outline" size={20} color="black" style={styles.icon} />
          <Text style={styles.cardText}>
            <Text style={styles.bold}>Post </Text>
            Your post has been
          </Text>
          <Image
            source={{ uri: 'https://placekitten.com/120/120' }}
            style={styles.image}
          />
        </View>

        {/* Earlier */}
        <Text style={styles.sectionTitle}>Earlier</Text>
        <View style={styles.card}>
          <FontAwesome name="heart" size={20} color="black" style={styles.icon} />
          <Text style={styles.cardText}>
            <Text style={styles.bold}>New </Text>
            You have new likes on your
          </Text>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/women/2.jpg' }}
            style={styles.image}
          />
        </View>

        <View style={styles.card}>
          <MaterialIcons name="chat-bubble-outline" size={20} color="black" style={styles.icon} />
          <Text style={styles.cardText}>
            <Text style={styles.bold}>New </Text>
            Someone commented on
          </Text>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/3.jpg' }}
            style={styles.image}
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Ionicons name="home" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
          <Ionicons name="calendar" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="people" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="settings" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  scrollContainer: { paddingHorizontal: 10 },
  sectionTitle: {
    marginTop: 15,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#e6e6e6',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 6,
  },
  icon: { marginRight: 10 },
  avatar: { width: 30, height: 30, borderRadius: 15, marginRight: 10 },
  cardText: { flex: 1, fontSize: 14 },
  bold: { fontWeight: 'bold' },
  image: { width: 40, height: 40, borderRadius: 8, marginLeft: 10 },
  followButton: {
    backgroundColor: '#6C3483',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  followText: { color: '#fff', fontWeight: 'bold' },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#6C3483',
  },
});
