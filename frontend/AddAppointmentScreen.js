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
import PopupAlert from './PopupAlert';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

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

  const servicesList = ['Haircut', 'Facial', 'Manicure', 'Hair Coloring', 'Pedicure', 'Massage', 'Eyebrow Threading'];
  const staffList = ['John', 'Sarah', 'Emily', 'Michael', 'Jessica'];

  const showPopup = (title, message, type = 'default') => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupType(type);
    setPopupVisible(true);
  };

  // Fixed date handling to prevent timezone shifts
  const handleSubmit = async () => {
    if (!name.trim() || !number.trim() || !service || !staff || !date) {
      showPopup('Error', 'Please fill all required fields', 'error');
      return;
    }

    // Validate phone number (basic validation)
    if (number.length < 10) {
      showPopup('Error', 'Please enter a valid phone number', 'error');
      return;
    }

    // FORCE local date components - this prevents any timezone conversion
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Build strings directly from components
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

    console.log('Original date object:', date);
    console.log('Extracted components:', { year, month, day, hours, minutes });
    console.log('Sending dateStr:', dateStr, 'timeStr:', timeStr);

    try {
      const res = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          phone: number.trim(),
          date: dateStr,
          time: timeStr,
          service,
          stylist: staff,
          notes: notes.trim()
        })
      });

      const result = await res.json();

      if (result.success) { 
        showPopup('Success', 'Appointment added successfully!', 'success');

        // Clear form after successful submission
        setName('');
        setNumber('');
        setService('');
        setStaff('');
        setNotes('');
        setDate(new Date());

        // Navigate back with refresh flag
        setTimeout(() => {
          navigation.navigate('ManageAppointments', { refresh: true });
        }, 1500);
      } else {
        showPopup('Error', result.message || 'Failed to add appointment', 'error');
      }

    } catch (err) {
      console.error('Submit error:', err);
      showPopup('Error', 'Network error. Please check your connection.', 'error');
    }
  };

  // Handle date picker changes (prevents timezone shifts)
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Create new date preserving the time components
      const newDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
      );
      setDate(newDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      // Create new date preserving the date components
      const newDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes(),
        selectedTime.getSeconds()
      );
      setDate(newDate);
    }
  };

  const handleWebDateChange = (selectedDate) => {
    if (selectedDate) {
      console.log('Web date picker selected:', selectedDate);
      
      // For date-only picker, preserve the existing time
      if (selectedDate.getHours() === 0 && selectedDate.getMinutes() === 0) {
        const newDate = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          date.getHours(),
          date.getMinutes(),
          0
        );
        console.log('Created date with preserved time:', newDate);
        setDate(newDate);
      } else {
        // For time picker, preserve the existing date
        const newDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          selectedDate.getHours(),
          selectedDate.getMinutes(),
          0
        );
        console.log('Created date with preserved date:', newDate);
        setDate(newDate);
      }
    }
  };

  // Formatted date & time for display
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Add New Appointment</Text>

      {/* Customer Name */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Customer Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter customer name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          maxLength={50}
        />
      </View>

      {/* Contact Number */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Contact Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={number}
          onChangeText={setNumber}
          maxLength={15}
        />
      </View>

      {/* Service Selection */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Service *</Text>
        {Platform.OS === 'web' ? (
          <select
            style={styles.webSelect}
            value={service}
            onChange={(e) => setService(e.target.value)}
          >
            <option value="">Select a service</option>
            {servicesList.map((s, i) => (
              <option key={i} value={s}>{s}</option>
            ))}
          </select>
        ) : (
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              style={[styles.input, styles.pickerButton]}
              onPress={() => {
                // You can implement a modal picker for mobile if needed
                // For now, using TextInput as fallback
              }}
            >
              <Text style={[styles.pickerText, !service && styles.placeholderText]}>
                {service || 'Select a service'}
              </Text>
            </TouchableOpacity>
            {/* Simple dropdown simulation for mobile - you might want to use a proper picker */}
            <ScrollView style={styles.servicesList} nestedScrollEnabled>
              {servicesList.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.serviceItem}
                  onPress={() => setService(s)}
                >
                  <Text style={[styles.serviceText, service === s && styles.selectedService]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Staff Selection */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Staff Member *</Text>
        {Platform.OS === 'web' ? (
          <select
            style={styles.webSelect}
            value={staff}
            onChange={(e) => setStaff(e.target.value)}
          >
            <option value="">Select staff member</option>
            {staffList.map((s, i) => (
              <option key={i} value={s}>{s}</option>
            ))}
          </select>
        ) : (
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              style={[styles.input, styles.pickerButton]}
              onPress={() => {
                // Similar to service picker
              }}
            >
              <Text style={[styles.pickerText, !staff && styles.placeholderText]}>
                {staff || 'Select staff member'}
              </Text>
            </TouchableOpacity>
            <ScrollView style={styles.servicesList} nestedScrollEnabled>
              {staffList.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.serviceItem}
                  onPress={() => setStaff(s)}
                >
                  <Text style={[styles.serviceText, staff === s && styles.selectedService]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Date Picker */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Appointment Date *</Text>
        {Platform.OS === 'web' ? (
          <div style={styles.webPickerContainer}>
            <DatePicker
              selected={date}
              onChange={handleWebDateChange}
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              className="web-date-picker"
             // style={styles.webInput}
              placeholderText="Select date"
            />
          </div>
        ) : (
          <>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeText}>{formattedDate}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={handleDateChange}
              />
            )}
          </>
        )}
      </View>

      {/* Time Picker */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Appointment Time *</Text>
        {Platform.OS === 'web' ? (
          <div style={styles.webPickerContainer}>
            <DatePicker
              selected={date}
              onChange={handleWebDateChange}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="h:mm aa"
              className="web-date-picker"
             // style={styles.webInput}
              placeholderText="Select time"
            />
          </div>
        ) : (
          <>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateTimeText}>{formattedTime}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={date}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </>
        )}
      </View>

      {/* Notes */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Additional Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Any special requirements or notes..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={notes}
          onChangeText={setNotes}
          maxLength={200}
        />
        <Text style={styles.characterCount}>{notes.length}/200</Text>
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.submitButton, (!name || !number || !service || !staff) && styles.disabledButton]} 
        onPress={handleSubmit}
        disabled={!name || !number || !service || !staff}
      >
        <Text style={styles.submitButtonText}>Save Appointment</Text>
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity 
        style={styles.cancelButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
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

const PURPLE = '#6C3483';
const LIGHT_PURPLE = '#F5EDFF';
const BORDER = '#E5D6FF';
const GRAY = '#666';
const LIGHT_GRAY = '#f9f6fb';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PURPLE,
    marginBottom: 25,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: PURPLE,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2a2a2a',
  },
  pickerContainer: {
    position: 'relative',
  },
  pickerButton: {
    justifyContent: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#2a2a2a',
  },
  placeholderText: {
    color: '#999',
  },
  servicesList: {
    maxHeight: 120,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 5,
  },
  serviceItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  serviceText: {
    fontSize: 16,
    color: '#2a2a2a',
  },
  selectedService: {
    color: PURPLE,
    fontWeight: '600',
  },
  webSelect: {
    width: '100%',
    padding: 12,
    borderRadius: 10,
    borderColor: BORDER,
    borderWidth: 1,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#2a2a2a',
  },
  webPickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    backgroundColor: '#fff',
},
webInput: {
    width: '100%',
    padding: 12,
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    outline: 'none',
    color: '#2a2a2a',
    backgroundColor: 'transparent',
},

  dateTimeButton: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#2a2a2a',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: GRAY,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: PURPLE,
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    elevation: 0,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: PURPLE,
    marginBottom: 20,
  },
  cancelButtonText: {
    color: PURPLE,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});