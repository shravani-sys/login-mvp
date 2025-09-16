import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const API = "http://10.168.97.225:5000/api/appointments";

// Parse "YYYY-MM-DD" + "HH:mm" -> Date
const parseApptDate = (dateStr, timeStr) => {
  const safeTime =
    /^\d{2}:\d{2}$/.test(timeStr)
      ? timeStr
      : new Date(`1970-01-01 ${timeStr}`).toTimeString().slice(0, 5);

  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = safeTime.split(":").map(Number);
  const dt = new Date();
  dt.setFullYear(y, m - 1, d);
  dt.setHours(hh, mm, 0, 0);
  return dt;
};

export default function ManageAppointmentsScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("current"); // 'current' | 'upcoming' | 'past'
  const [refreshing, setRefreshing] = useState(false);
  const route = useRoute();

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API}?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  //  Refresh when screen becomes active or when search changes
  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [search])
  );

  // If coming from Add screen with refresh flag
  useFocusEffect(
    useCallback(() => {
      if (route.params?.refresh) {
        fetchAppointments();
        navigation.setParams({ refresh: false });
      }
    }, [route.params?.refresh])
  );

  const now = new Date();
  const todayKey = [now.getFullYear(), now.getMonth(), now.getDate()].join("-");

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const when = parseApptDate(a.date, a.time);
      const isPast = when < now;
      const isToday =
        [when.getFullYear(), when.getMonth(), when.getDate()].join("-") ===
        todayKey;

      if (tab === "past") return isPast;
      if (tab === "upcoming") return !isPast && !isToday;
      return isToday;
    });
  }, [appointments, tab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    const dt = parseApptDate(item.date, item.time);
    return (
      <View style={styles.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.name}>{item.customerName}</Text>
          <Text style={styles.time}>
            {dt.toLocaleDateString()}{" "}
            {dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
        <Text style={styles.meta}>Service: {item.service}</Text>
        <Text style={styles.meta}>Stylist: {item.stylist}</Text>
        {item.phone ? (
          <Text style={styles.meta}>Phone: {item.phone}</Text>
        ) : null}
        {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>All Appointments</Text>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons
          name="search"
          size={18}
          color="#6C3483"
          style={{ marginRight: 8 }}
        />
        <TextInput
          placeholder="Search by name / phone / service"
          placeholderTextColor="#8f7aa8"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {["current", "upcoming", "past"].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "current"
                ? "Today"
                : t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id?.toString() || item._id?.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No appointments found.</Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Add button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddAppointment")}
      >
        <Ionicons name="add" size={26} color="#fff" />
        <Text style={styles.fabText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
}

const PURPLE = "#6C3483";
const LILAC = "#F5EDFF";
const BORDER = "#E5D6FF";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: {
    color: PURPLE,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LILAC,
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: { flex: 1, color: "#2b2b2b", fontSize: 15 },
  tabs: { flexDirection: "row", marginBottom: 10 },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#f1e8ff",
    marginRight: 8,
  },
  tabActive: { backgroundColor: PURPLE },
  tabText: { color: PURPLE, fontWeight: "600" },
  tabTextActive: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: "700", color: "#2a2a2a" },
  time: { fontSize: 12, fontWeight: "600", color: PURPLE },
  meta: { marginTop: 6, color: "#404040" },
  notes: { marginTop: 6, color: "#6b6b6b", fontStyle: "italic" },
  emptyText: { textAlign: "center", marginTop: 20, color: "#7d7d7d" },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 20,
    backgroundColor: PURPLE,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 28,
    elevation: 4,
  },
  fabText: { color: "#fff", marginLeft: 6, fontWeight: "700" },
});
