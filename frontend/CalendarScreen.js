import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Calendar } from 'react-native-calendars';

const CalenderScreen = ({ navigation }) => {
  const [currentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [employeesOnLeave, setEmployeesOnLeave] = useState(0);
  const [selectedDateAppointments, setSelectedDateAppointments] = useState([]);

  const BASE_URL = 'http://192.168.106.225:5000'; // replace with your IP if needed

  // Fetch appointments for a specific date
  const fetchAppointmentsByDate = async (date) => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/appointments?date=${date}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        const formattedAppointments = data.appointments.map((appointment) => ({
          id: appointment.id,
          title: appointment.title || appointment.customerName,
          time: appointment.time,
          service: appointment.service,
          stylist: appointment.stylist,
          notes: appointment.notes,
          color: '#8B5CF6',
        }));
        setSelectedDateAppointments(formattedAppointments);
      } else {
        setSelectedDateAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setSelectedDateAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle date selection
  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    fetchAppointmentsByDate(day.dateString);
  };

  // Load today's appointments on mount
  useEffect(() => {
    fetchAppointmentsByDate(selectedDate);
  }, []);

  // Generate marked dates for calendar
  const getMarkedDates = () => {
    const marked = {};
    if (selectedDateAppointments.length > 0) {
      marked[selectedDate] = {
        marked: true,
        dotColor: '#8B5CF6',
        selected: true,
        selectedColor: '#8B5CF6',
        selectedTextColor: '#FFFFFF',
      };
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: 'rgba(139, 92, 246, 0.2)',
        selectedTextColor: '#8B5CF6',
      };
    }

    const today = new Date().toISOString().split('T')[0];
    if (today !== selectedDate) {
      marked[today] = {
        ...marked[today],
        selected: true,
        selectedColor: 'rgba(139, 92, 246, 0.2)',
        selectedTextColor: '#8B5CF6',
      };
    }

    return marked;
  };

  const handleMonthChange = (month) => {
    // Optional: Fetch month data if needed
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const fullDaysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const day = fullDaysOfWeek[date.getDay()];

    return {
      dayName: day.substring(0, 3),
      dayNumber: date.getDate(),
      fullDate: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };
  };

  const handleGoBack = () => {
    navigation.navigate('Dashboard');
  };

  const renderAppointment = (appointment) => (
    <View key={appointment.id} style={styles.eventItem}>
      <View style={[styles.eventIndicator, { backgroundColor: appointment.color }]} />
      <View style={styles.eventDetails}>
        <Text style={styles.eventTitle}>{appointment.title}</Text>
        <Text style={styles.eventTime}>{appointment.time}</Text>
        {appointment.service && (
          <Text style={styles.eventService}>{appointment.service}</Text>
        )}
        {appointment.stylist && (
          <Text style={styles.eventStylist}>with {appointment.stylist}</Text>
        )}
        {appointment.notes && (
          <Text style={styles.eventNotes}>{appointment.notes}</Text>
        )}
      </View>
    </View>
  );

  const formattedSelectedDate = formatDate(selectedDate);
  const markedDates = getMarkedDates();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendar</Text>
        <View style={styles.addButton}>
          <Icon name="add" size={24} color="#000" />
        </View>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={handleDateSelect}
            onMonthChange={handleMonthChange}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#D3D3D3',
              calendarBackground: '#D3D3D3',
              textSectionTitleColor: '#000',
              selectedDayBackgroundColor: '#8B5CF6',
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: '#8B5CF6',
              dayTextColor: '#000',
              textDisabledColor: '#888',
              dotColor: '#8B5CF6',
              selectedDotColor: '#FFFFFF',
              arrowColor: '#000',
              monthTextColor: '#000',
              indicatorColor: '#8B5CF6',
            }}
            firstDay={1}
            enableSwipeMonths={true}
            hideExtraDays={true}
          />
        </View>

        {/* Employee Leave Counter */}
        <View style={styles.leaveCounter}>
          <Text style={styles.leaveText}>
            Employee on Leave Today : {employeesOnLeave}
          </Text>
        </View>

        {/* Appointments */}
        {selectedDateAppointments.length > 0 && (
          <View style={styles.eventsContainer}>
            <View style={styles.dateLabel}>
              <View
                style={[styles.dateLabelCircle, { backgroundColor: '#8B5CF6' }]}
              >
                <Text style={styles.dateLabelText}>
                  {formattedSelectedDate.dayNumber}
                </Text>
              </View>
              <Text style={styles.dayNameText}>
                {formattedSelectedDate.dayName}
              </Text>
              <Text style={styles.fullDateText}>
                {formattedSelectedDate.fullDate}
              </Text>
            </View>

            <View style={styles.eventsList}>
              <Text style={styles.appointmentsHeader}>
                Appointments ({selectedDateAppointments.length})
              </Text>
              {selectedDateAppointments.map(renderAppointment)}
            </View>
          </View>
        )}

        {/* No Appointments */}
        {selectedDateAppointments.length === 0 && !loading && (
          <View style={styles.noEventsContainer}>
            <View style={styles.dateLabel}>
              <View
                style={[styles.dateLabelCircle, { backgroundColor: '#666' }]}
              >
                <Text style={styles.dateLabelText}>
                  {formattedSelectedDate.dayNumber}
                </Text>
              </View>
              <Text style={styles.dayNameText}>
                {formattedSelectedDate.dayName}
              </Text>
              <Text style={styles.fullDateText}>
                {formattedSelectedDate.fullDate}
              </Text>
            </View>
            <View style={styles.noEventsCard}>
              <Text style={styles.noEventsText}>
                No appointments scheduled for this day
              </Text>
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Icon name="calendar-today" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="people" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="settings" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  addButton: { padding: 8 },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  loadingText: { marginTop: 8, fontSize: 14, color: '#666' },
  content: { flex: 1 },
  calendarContainer: {
    backgroundColor: '#D3D3D3',
    margin: 16,
    borderRadius: 8,
    padding: 16,
  },
  leaveCounter: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  leaveText: { fontSize: 14, color: '#000', fontWeight: '500' },
  eventsContainer: { marginHorizontal: 16, marginTop: 16 },
  noEventsContainer: { marginHorizontal: 16, marginTop: 16 },
  dateLabel: { alignItems: 'center', marginBottom: 12 },
  dateLabelCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateLabelText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  dayNameText: { fontSize: 14, color: '#666', marginTop: 4 },
  fullDateText: { fontSize: 12, color: '#999', marginTop: 2 },
  eventsList: { backgroundColor: '#FFF', borderRadius: 8, padding: 16 },
  appointmentsHeader: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 12 },
  noEventsCard: { backgroundColor: '#FFF', borderRadius: 8, padding: 20, alignItems: 'center' },
  noEventsText: { fontSize: 14, color: '#666', fontStyle: 'italic', marginBottom: 12 },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  eventIndicator: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  eventDetails: { marginLeft: 12, flex: 1 },
  eventTitle: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 2 },
  eventTime: { fontSize: 14, color: '#8B5CF6', fontWeight: '500', marginBottom: 2 },
  eventService: { fontSize: 14, color: '#666', marginBottom: 1 },
  eventStylist: { fontSize: 13, color: '#999', fontStyle: 'italic', marginBottom: 2 },
  eventNotes: { fontSize: 12, color: '#888', fontStyle: 'italic' },
  bottomPadding: { height: 20 },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#6C3483',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  activeNavItem: { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 8 },
});

export default CalenderScreen;
