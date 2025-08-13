import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  StyleSheet,
  ScrollView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-datepicker';
import PopupAlert from './PopupAlert'; // import your PopupAlert
import 'react-datepicker/dist/react-datepicker.css';

export default function AddAppointmentScreen({ navigation }) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [service, setService] = useState('');
  const [staff, setStaff] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('default');

  const servicesList = ['Haircut', 'Facial', 'Manicure'];
  const staffList = ['John', 'Sarah', 'Emily'];

  const showPopup = (title, message, type = 'default') => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupType(type);
    setPopupVisible(true);
  };

  // --- Submit handler ---
  const handleSubmit = async () => {
    if (!name || !number || !service || !staff || !date) {
      showPopup('Error', 'Please fill all fields', 'error');
      return;
    }

    // Correctly format date: YYYY-MM-DD
    const dateStr = date.getFullYear() + '-' +
                    String(date.getMonth() + 1).padStart(2, '0') + '-' +
                    String(date.getDate()).padStart(2, '0');

    // Correctly format time: HH:mm (24-hour)
    const timeStr = String(date.getHours()).padStart(2, '0') + ':' +
                    String(date.getMinutes()).padStart(2, '0');

    try {
      const res = await fetch('http://10.160.95.225:5000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          phone: number,
          date: dateStr,
          time: timeStr,
          service,
          stylist: staff,
          notes
        })
      });

      if (!res.ok) {
        const err = await res.json();
        showPopup('Error', err.message || 'Failed to add appointment', 'error');
        return;
      }

      showPopup('Success', 'Appointment Added Successfully', 'success');

      // Clear form
      setName('');
      setNumber('');
      setService('');
      setStaff('');
      setNotes('');
      setDate(new Date());

      // Navigate back to ManageAppointmentsScreen with refresh
      navigation.navigate('ManageAppointments', { refresh: true });

    } catch (err) {
      console.error(err);
      showPopup('Error', 'Network error', 'error');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Add Appointment</Text>

      <TextInput
        style={styles.input}
        placeholder="Customer Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        keyboardType="phone-pad"
        value={number}
        onChangeText={setNumber}
      />

      {/* Service Dropdown */}
      <View style={styles.dropdown}>
        {Platform.OS === 'web' ? (
          <select
            style={styles.webSelect}
            value={service}
            onChange={(e) => setService(e.target.value)}
          >
            <option value="">Select Service</option>
            {servicesList.map((s, i) => (
              <option key={i} value={s}>{s}</option>
            ))}
          </select>
        ) : (
          <TextInput
            style={styles.input}
            placeholder="Service"
            value={service}
            onChangeText={setService}
          />
        )}
      </View>

      {/* Staff Dropdown */}
      <View style={styles.dropdown}>
        {Platform.OS === 'web' ? (
          <select
            style={styles.webSelect}
            value={staff}
            onChange={(e) => setStaff(e.target.value)}
          >
            <option value="">Select Staff</option>
            {staffList.map((s, i) => (
              <option key={i} value={s}>{s}</option>
            ))}
          </select>
        ) : (
          <TextInput
            style={styles.input}
            placeholder="Staff"
            value={staff}
            onChangeText={setStaff}
          />
        )}
      </View>

      {/* Date Picker */}
      {Platform.OS === 'web' ? (
        <DatePicker
          selected={date}
          onChange={(d) => setDate(d)}
          dateFormat="dd/MM/yyyy"
          className="web-date-picker"
        />
      ) : (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.buttonText}>Select Date</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(e, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
        </>
      )}

      {/* Time Picker */}
      {Platform.OS === 'web' ? (
        <DatePicker
          selected={date}
          onChange={(d) => setDate(d)}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={15}
          timeCaption="Time"
          dateFormat="h:mm aa"
        />
      ) : (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.buttonText}>Select Time</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display="default"
              onChange={(e, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) setDate(selectedTime);
              }}
            />
          )}
        </>
      )}

      {/* Notes */}
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Notes"
        multiline
        value={notes}
        onChangeText={setNotes}
      />

      {/* Submit */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Save Appointment</Text>
      </TouchableOpacity>

      {/* Popup Alert */}
      <PopupAlert
        visible={popupVisible}
        title={popupTitle}
        message={popupMessage}
        type={popupType}
        onClose={() => setPopupVisible(false)}
      />
    </ScrollView>
  );
}

const purple = '#6a1b9a';
const lightPurple = '#9c4dcc';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f6fb' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: purple },
  input: {
    borderWidth: 1,
    borderColor: lightPurple,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff'
  },
  dropdown: { marginBottom: 12 },
  webSelect: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    borderColor: lightPurple,
    borderWidth: 1,
    backgroundColor: '#fff'
  },
  button: { backgroundColor: purple, padding: 10, borderRadius: 8, marginBottom: 12 },
  buttonText: { color: '#fff', textAlign: 'center' },
  submitButton: { backgroundColor: purple, padding: 12, borderRadius: 8 },
  submitButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});
