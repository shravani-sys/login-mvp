import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  StyleSheet,
  Alert,
} from "react-native";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const API = "http://192.168.106.225:5000/api/appointments";

// ENHANCED Parser: More robust time handling with detailed logging
const parseApptDate = (dateStr, timeStr, item = null) => {
  const rawDate = dateStr ? dateStr.toString().trim() : '';
  const rawTime = timeStr ? timeStr.toString().trim() : '';
  console.log(`// DEBUG: Parsing for item ${item?.id || 'unknown'}: rawDate="${rawDate}", rawTime="${rawTime}"`);

  const rawDisplay = `${rawDate} ${rawTime}`.trim() || 'No date/time';

  // Early exit if both empty
  if (!rawDate && !rawTime) {
    console.warn(`// DEBUG: Both empty for ${item?.id}. Invalid.`);
    return { dt: new Date(1970, 0, 1), isValidDate: false, isValidTime: false, rawDisplay };
  }

  let dt;
  let isValidDate = false;
  let isValidTime = false;

  // Method 1: Strict YYYY-MM-DD + HH:MM:SS (your exact format)
  if (rawDate.includes('-')) {
    const dateParts = rawDate.split("-").map(Number);
    if (dateParts.length === 3 && dateParts.every(p => !isNaN(p))) {
      const [y, m, d] = dateParts;
      let hh = 12, mm = 0;  // Default to 12:00 PM if time invalid
      if (rawTime && rawTime.includes(':')) {
        // Enhanced: Split HH:MM:SS explicitly and validate numeric
        const timeParts = rawTime.split(":").map(part => Number(part.trim()));
        console.log(`// DEBUG: Time parts for ${item?.id}: [${timeParts.join(', ')}] from "${rawTime}"`);
        if (timeParts.length >= 2 && timeParts[0] >= 0 && timeParts[1] >= 0 && !isNaN(timeParts[0]) && !isNaN(timeParts[1])) {
          hh = Math.min(Math.max((timeParts[0] || 0) % 24, 0), 23);  // HH (0-23)
          mm = Math.min(Math.max((timeParts[1] || 0) % 60, 0), 59);  // MM (0-59)
          // Ignore SS (timeParts[2])
          isValidTime = true;
          console.log(`// DEBUG: Time parsed SUCCESS for ${item?.id}: hh=${hh}, mm=${mm}, rawTime="${rawTime}" (validTime=${isValidTime})`);
        } else {
          console.warn(`// DEBUG: Time format invalid for ${item?.id}: parts length=${timeParts.length}, non-numeric or out of range. Defaulting to 12:00 PM.`);
        }
      } else {
        console.log(`// DEBUG: No/Invalid time string for ${item?.id} (no ':'), defaulting to 12:00 PM`);
      }
      dt = new Date(y, m - 1, d, hh, mm, 0, 0);  // Explicit seconds=0
      if (!isNaN(dt.getTime()) && dt.getFullYear() > 1970) {
        isValidDate = true;
        console.log(`// DEBUG: SUCCESS (Method 1) for ${item?.id}: ${dt.toISOString()} (dateValid=${isValidDate}, timeValid=${isValidTime})`);
        return { dt, isValidDate, isValidTime, rawDisplay };
      } else {
        console.warn(`// DEBUG: Date construction failed for ${item?.id}: y=${y}, m=${m-1}, d=${d}, hh=${hh}, mm=${mm}`);
      }
    }
  }

  // Fallback methods (unchanged, for completeness)
  // Method 2: US Format MM/DD/YYYY + time
  if (!isValidDate && rawDate.includes('/')) {
    const dateParts = rawDate.split("/").map(Number);
    if (dateParts.length === 3 && dateParts.every(p => !isNaN(p))) {
      const [m, d, y] = dateParts;
      let hh = 12, mm = 0;
      if (rawTime && rawTime.includes(':')) {
        const timeParts = rawTime.split(":").map(part => Number(part.trim()));
        if (timeParts.length >= 2 && timeParts[0] >= 0 && timeParts[1] >= 0) {
          hh = Math.min((timeParts[0] || 0) % 24, 23);
          mm = Math.min((timeParts[1] || 0) % 60, 59);
          isValidTime = true;
        }
      }
      dt = new Date(y, m - 1, d, hh, mm, 0, 0);
      if (!isNaN(dt.getTime()) && dt.getFullYear() > 1970) {
        isValidDate = true;
        console.log(`// DEBUG: SUCCESS (Method 2 US) for ${item?.id}: ${dt.toISOString()}`);
        return { dt, isValidDate, isValidTime, rawDisplay };
      }
    }
  }

  // Method 3: Full string
  const fullStr = `${rawDate} ${rawTime}`.trim();
  if (!isValidDate && fullStr) {
    dt = new Date(fullStr);
    if (!isNaN(dt.getTime()) && dt.getFullYear() > 1970) {
      isValidDate = true;
      isValidTime = !!rawTime;  // Assume time valid if full parses
      console.log(`// DEBUG: SUCCESS (Method 3 Full) for ${item?.id}: ${dt.toISOString()}`);
      return { dt, isValidDate, isValidTime, rawDisplay };
    }
  }

  // Method 4: Date only
  if (!isValidDate && rawDate) {
    dt = new Date(rawDate);
    if (!isNaN(dt.getTime()) && dt.getFullYear() > 1970) {
      isValidDate = true;
      isValidTime = false;
      console.log(`// DEBUG: SUCCESS (Method 4 Date Only) for ${item?.id}: ${dt.toISOString()} (time missing)`);
      return { dt, isValidDate, isValidTime, rawDisplay: `${rawDate} (time missing)` };
    }
  }

  // Final fallback
  console.warn(`// DEBUG: ALL FAILED for ${item?.id}. Raw: "${rawDisplay}".`);
  return { dt: new Date(1970, 0, 1), isValidDate: false, isValidTime: false, rawDisplay };
};

export default function ManageAppointmentsScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("current");
  const [refreshing, setRefreshing] = useState(false);
  const route = useRoute();

  const fetchAppointments = async () => {
    try {
      console.log('// DEBUG: Fetching appointments from API...');
      const res = await fetch(API);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      
      console.log('// DEBUG: FULL Raw fetched data:', data.appointments || []);
      let validDateCount = 0, validTimeCount = 0, invalidCount = 0;
      if (data.appointments && Array.isArray(data.appointments)) {
        data.appointments.forEach((appt) => {
          // Quick time format check
          const rawTime = appt.time ? appt.time.toString().trim() : '';
          const isTimeFormatOk = rawTime.includes(':') && rawTime.match(/^\d{1,2}:\d{2}(:\d{2})?$/);
          console.log(`// DEBUG: Quick time check for ${appt.id} (${appt.customerName}): "${rawTime}" → format ${isTimeFormatOk ? 'OK' : 'BAD'}`);
          
          const parsed = parseApptDate(appt.date, appt.time, appt);
          if (parsed.isValidDate) validDateCount++;
          if (parsed.isValidTime) validTimeCount++;
          if (!parsed.isValidDate) invalidCount++;
          console.log(`// DEBUG: Appt ${appt.id} (${appt.customerName}): dateValid=${parsed.isValidDate}, timeValid=${parsed.isValidTime}, raw="${parsed.rawDisplay}"`);
        });
        console.log(`// DEBUG: Fetch summary: ${data.appointments.length} total, ${validDateCount} date-valid, ${validTimeCount} time-valid, ${invalidCount} invalid`);
      }

      if (data.success && Array.isArray(data.appointments)) {
        setAppointments(data.appointments);
        console.log(`// DEBUG: Set ${data.appointments.length} appointments to state`);
      } else {
        setAppointments([]);
        Alert.alert('Warning', 'Invalid data from server. Try refreshing.');
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setAppointments([]);
      Alert.alert('Error', `Failed to load appointments: ${err.message}. Check your connection.`);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (route.params?.refresh) {
        console.log('// DEBUG: Auto-refresh triggered from Add screen');
        fetchAppointments();
        navigation.setParams({ refresh: false });
      }
    }, [route.params?.refresh, navigation])
  );

  // Filter: Date-based tabs (time doesn't affect categorization)
  const filtered = useMemo(() => {
    const now = new Date();
    const todayKey = [now.getFullYear(), now.getMonth() + 1, now.getDate()].join("-");  // YYYY-MM-DD key to match your format
    console.log(`// DEBUG: Filtering - now: ${now.toLocaleString()}, todayKey="${todayKey}", tab="${tab}", search="${search}", total: ${appointments.length}`);

    let todayCount = 0, upcomingCount = 0, pastCount = 0, invalidCount = 0;

    const result = appointments
      .filter((a) => {
        const term = search.toLowerCase().trim();
        if (!term) return true;
        const matches = (
          (a.customerName || "").toLowerCase().includes(term) ||
          (a.phone || "").toLowerCase().includes(term) ||
          (a.service || "").toLowerCase().includes(term) ||
          (a.stylist || "").toLowerCase().includes(term) ||
          (a.notes || "").toLowerCase().includes(term)
        );
        return matches;
      })
      .filter((a) => {
        const parsed = parseApptDate(a.date, a.time, a);
        const when = parsed.dt;
        const isValidDate = parsed.isValidDate;
        const apptKey = [when.getFullYear(), when.getMonth() + 1, when.getDate()].join("-");  // YYYY-MM-DD
        const isToday = apptKey === todayKey;
        const isFuture = when >= now && isValidDate;
        const isPast = when < now && isValidDate;

        if (!isValidDate) invalidCount++;
        else if (isToday) todayCount++;
        else if (isFuture) upcomingCount++;
        else pastCount++;

        console.log(`// DEBUG: Filter ${a.id || a.customerName}: key="${apptKey}", isToday=${isToday}, isFuture=${isFuture}, isPast=${isPast}, dateValid=${isValidDate}, timeValid=${parsed.isValidTime}`);

        let include = false;
        if (tab === "current") {
          include = isToday && isValidDate;
        } else if (tab === "upcoming") {
          include = !isToday && isFuture && isValidDate;
        } else if (tab === "past") {
          include = isPast || !isValidDate;  // Past or invalid
        }

        return include;
      });

    console.log(`// DEBUG: Tab "${tab}" - Today: ${todayCount}, Upcoming: ${upcomingCount}, Past: ${pastCount}, Invalid: ${invalidCount}, Filtered: ${result.length}`);
    return result;
  }, [appointments, search, tab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const handleEdit = (appt) =>
    navigation.navigate("AddAppointment", { appointment: appt, editMode: true });

  const renderItem = ({ item }) => {
    const parsed = parseApptDate(item.date, item.time, item);
    const dt = parsed.dt;
    const isValidDate = parsed.isValidDate;
    const isValidTime = parsed.isValidTime;
    const rawTime = item.time ? item.time.toString().trim() : '';

    let displayDateTime;
    if (isValidDate) {
      const dateStr = dt.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
      let timeStr;
      if (isValidTime) {
        timeStr = dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });  // e.g., "3:30 PM"
      } else {
        timeStr = rawTime ? `Time: ${rawTime}` : "Time: Not set";  // Show raw for debugging
      }
      displayDateTime = `${dateStr}\n${timeStr}`;
    } else {
      displayDateTime = `Raw: ${parsed.rawDisplay}`;
    }

    // Log for debugging time display
    console.log(`// DEBUG: Render dt for ${item.id}: ${dt.toISOString()}, display="${displayDateTime}", dateValid=${isValidDate}, timeValid=${isValidTime}, rawTime="${rawTime}"`);

    return (
      <View style={[styles.card, !isValidDate && styles.invalidCard]}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Text style={styles.name}>{item.customerName}</Text>
          <Text style={[styles.time, !isValidDate && styles.invalidTime]}>
            {displayDateTime}
          </Text>
        </View>
        <Text style={styles.meta}>Service: {item.service}</Text>
        <Text style={styles.meta}>Stylist: {item.stylist}</Text>
        {item.phone && <Text style={styles.meta}>Phone: {item.phone}</Text>}
        {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
        {!isValidDate && <Text style={styles.invalidWarning}>⚠️ Invalid date/time - edit to fix</Text>}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.editBtn]}
            onPress={() => handleEdit(item)}
            disabled={refreshing}
          >
            <Ionicons name="create-outline" size={18} color="#fff" />
            <Text style={styles.btnText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const getEmptyMessage = () => {
    if (refreshing) return "Loading appointments...";
    if (search) return "No matching appointments found.";
    switch (tab) {
      case "current":
        return "No appointments today.";
      case "upcoming":
        return "No upcoming appointments.";
      case "past":
        return "No past appointments.";
      default:
        return "No appointments found.";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Appointments</Text>

      <View style={styles.searchRow}>
        <Ionicons
          name="search"
          size={18}
          color="#6C3483"
          style={{ marginRight: 8 }}
        />
        <TextInput
          placeholder="Search by name, phone, service, stylist, or notes"
          placeholderTextColor="#8f7aa8"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.tabs}>
        {["current", "upcoming", "past"].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "current" ? "Today" : t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>

        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) =>
          item.id ? item.id.toString() : Math.random().toString(36)
        }
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>{getEmptyMessage()}</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

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
  title: { color: PURPLE, fontSize: 20, fontWeight: "700", marginBottom: 12 },
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
  name: { fontSize: 16, fontWeight: "700", color: "#2a2a2a", flex: 1 },
  time: { fontSize: 12, fontWeight: "600", color: PURPLE, textAlign: "right", flexShrink: 1 },
  invalidTime: { color: "#dc3545" },  // Red for invalid
  meta: { marginTop: 6, color: "#404040", fontSize: 14 },
  notes: { marginTop: 6, color: "#6b6b6b", fontStyle: "italic", fontSize: 14 },
  invalidWarning: { marginTop: 6, color: "#dc3545", fontSize: 12, fontStyle: "italic" },
  emptyText: { textAlign: "center", marginTop: 20, color: "#7d7d7d", fontSize: 16 },
  actions: { flexDirection: "row", marginTop: 12, justifyContent: "flex-end" },
  btn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginLeft: 8 },
  editBtn: { backgroundColor: "#28a745" },
  btnText: { color: "#fff", marginLeft: 5, fontWeight: "600", fontSize: 14 },
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
