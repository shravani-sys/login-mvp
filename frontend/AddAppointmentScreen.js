import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList
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

  // Mobile dropdown modals
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [staffModalVisible, setStaffModalVisible] = useState(false);

  const servicesList = ['Haircut', 'Facial', 'Manicure', 'Hair Coloring', 'Pedicure', 'Massage', 'Eyebrow Threading'];
  const staffList = ['John', 'Sarah', 'Emily', 'Michael', 'Jessica'];

  const showPopup = (title, message, type = 'default') => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupType(type);
    setPopupVisible(true);
  };

  // Format date as YYYY-MM-DD
  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format time as HH:mm:ss
  const formatTime = (d) => {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}:00`;
  };

  // Submit appointment
  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedNumber = number.trim();

    // Improved validation with specific messages
    if (!trimmedName) {
      showPopup('Error', 'Customer Name is required', 'error');
      return;
    }
    if (!trimmedNumber) {
      showPopup('Error', 'Contact Number is required', 'error');
      return;
    }
    if (trimmedNumber.length < 10) {  // Moved phone validation here for better flow
      showPopup('Error', 'Please enter a valid phone number (at least 10 digits)', 'error');
      return;
    }
    if (!service) {
      showPopup('Error', 'Service is required', 'error');
      return;
    }
    if (!staff) {
      showPopup('Error', 'Staff Member is required', 'error');
      return;
    }
    if (!date) {
      showPopup('Error', 'Appointment Date is required', 'error');
      return;
    }

    // For debugging: Log the values to console (remove after fixing)
    console.log('Validation passed. Values:', {
      name: trimmedName,
      number: trimmedNumber,
      service,
      staff,
      date: formatDate(date),
      time: formatTime(date),
      notes: notes.trim() || null  // Optional: Send null instead of '' if server dislikes empty strings
    });

    const body = {
      customerName: trimmedName,
      phone: trimmedNumber,
      date: formatDate(date),
      time: formatTime(date),
      service,
      stylist: staff,
      notes: notes.trim() || null  // Changed: Send null if empty (adjust based on your server schema)
    };

    console.log('Sending appointment:', body);

    try {
      const res = await fetch('http://192.168.106.225:5000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await res.json();

      if (result.success) {
        showPopup('Success', 'Appointment added successfully!', 'success');

        // Reset form
        setName('');
        setNumber('');
        setService('');
        setStaff('');
        setNotes('');
        setDate(new Date());

        setTimeout(() => navigation.navigate('ManageAppointments', { refresh: true }), 1500);
      } else {
        showPopup('Error', result.message || 'Failed to add appointment', 'error');
      }
    } catch (err) {
      console.error('Submit error:', err);
      showPopup('Error', 'Network error. Please check your connection.', 'error');
    }
  };

  // Mobile Date & Time pickers
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        date.getHours(),
        date.getMinutes(),
        0
      );
      setDate(newDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes(),
        0
      );
      setDate(newDate);
    }
  };

  // Web pickers
  const handleWebDateChange = (selectedDate) => {
    if (!selectedDate) return;
    const newDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      date.getHours(),
      date.getMinutes(),
      0
    );
    setDate(newDate);
  };

  const handleWebTimeChange = (selectedTime) => {
    if (!selectedTime) return;
    const newDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      selectedTime.getHours(),
      selectedTime.getMinutes(),
      0
    );
    setDate(newDate);
  };

  const formattedDate = date.toLocaleDateString('en-US', { weekday:'long', day:'numeric', month:'short', year:'numeric' });
  const formattedTime = date.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', hour12:true });

  // Helper for trimmed checks (used in disabled)
  const isFormValid = () => {
    return name.trim() && number.trim() && service && staff && date;
  };

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
          <select style={styles.webSelect} value={service} onChange={(e) => setService(e.target.value)}>
            <option value="">Select a service</option>
            {servicesList.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
        ) : (
          <>
            <TouchableOpacity style={styles.input} onPress={() => setServiceModalVisible(true)}>
              <Text style={{ color: service ? '#2a2a2a' : '#999' }}>{service || 'Select a service'}</Text>
            </TouchableOpacity>
            <Modal visible={serviceModalVisible} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <FlatList
                    data={servicesList}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.modalItem} onPress={() => { setService(item); setServiceModalVisible(false); }}>
                        <Text style={{ fontSize:16 }}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity onPress={() => setServiceModalVisible(false)} style={styles.modalClose}>
                    <Text style={{ color:'#fff', fontWeight:'bold' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </>
        )}
      </View>

      {/* Staff Selection */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Staff Member *</Text>
        {Platform.OS === 'web' ? (
          <select style={styles.webSelect} value={staff} onChange={(e) => setStaff(e.target.value)}>
            <option value="">Select staff member</option>
            {staffList.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
        ) : (
          <>
            <TouchableOpacity style={styles.input} onPress={() => setStaffModalVisible(true)}>
              <Text style={{ color: staff ? '#2a2a2a' : '#999' }}>{staff || 'Select staff member'}</Text>
            </TouchableOpacity>
            <Modal visible={staffModalVisible} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <FlatList
                    data={staffList}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.modalItem} onPress={() => { setStaff(item); setStaffModalVisible(false); }}>
                        <Text style={{ fontSize:16 }}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity onPress={() => setStaffModalVisible(false)} style={styles.modalClose}>
                    <Text style={{ color:'#fff', fontWeight:'bold' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </>
        )}
      </View>

      {/* Date Picker */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Appointment Date *</Text>
        {Platform.OS === 'web' ? (
          <DatePicker
            selected={date}
            onChange={handleWebDateChange}
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
            className="web-date-picker"
          />
        ) : (
          <>
            <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)}>
              <Text>{formattedDate}</Text>
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
          <DatePicker
            selected={date}
            onChange={handleWebTimeChange}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="HH:mm"
            className="web-date-picker"
          />
        ) : (
          <>
            <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowTimePicker(true)}>
              <Text>{formattedTime}</Text>
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

      {/* Notes (optional) */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Additional Notes (Optional)</Text>  {/* Added "Optional" for clarity */}
        <TextInput
          style={[styles.input, { height:100, textAlignVertical:'top' }]}
          placeholder="Any special requirements or notes..."
          placeholderTextColor="#999"
          multiline
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[
          styles.submitButton, 
          (!isFormValid() || number.trim().length < 10) && styles.disabledButton  // Fixed: Added trim and phone length check
        ]}
        onPress={handleSubmit}
        disabled={!isFormValid() || number.trim().length < 10}  // Fixed: Use helper and trim
      >
        <Text style={styles.submitButtonText}>Save Appointment</Text>
      </TouchableOpacity>

      {/* Cancel */}
      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>

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
const BORDER = '#E5D6FF';

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#fff' },
  heading: { fontSize:24, fontWeight:'bold', color:PURPLE, marginBottom:25, textAlign:'center' },
  inputContainer: { marginBottom:20 },
  label: { fontSize:16, fontWeight:'600', color:PURPLE, marginBottom:8 },
  input: { borderWidth:1, borderColor:BORDER, borderRadius:10, padding:12, fontSize:16, backgroundColor:'#fff', color:'#2a2a2a' },
  dateTimeButton: { borderWidth:1, borderColor:BORDER, borderRadius:10, padding:12, backgroundColor:'#fff' },
  submitButton: { backgroundColor:PURPLE, padding:15, borderRadius:10, marginTop:10 },
  disabledButton: { backgroundColor:'#ccc' },
  submitButtonText: { color:'#fff', textAlign:'center', fontSize:18, fontWeight:'bold' },
  cancelButton: { backgroundColor:'transparent', padding:15, borderRadius:10, borderWidth:2, borderColor:PURPLE, marginBottom:20 },
  cancelButtonText: { color:PURPLE, textAlign:'center', fontSize:16, fontWeight:'600' },
  webSelect: { width:'100%', padding:12, borderRadius:10, borderColor:BORDER, borderWidth:1, backgroundColor:'#fff', fontSize:16, color:'#2a2a2a' },
  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' },
  modalContent: { backgroundColor:'#fff', borderRadius:10, padding:20, width:'80%', maxHeight:'70%' },
  modalItem: { padding:12, borderBottomWidth:1, borderBottomColor:'#eee' },
  modalClose: { backgroundColor:PURPLE, padding:12, borderRadius:10, marginTop:10, alignItems:'center' }
});
