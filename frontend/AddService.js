import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import PopupAlert from './PopupAlert'; // Adjust the import path as needed

// Configurable API base URL (standardized)
const API_BASE_URL = 'http://192.168.106.225:5000';

export default function AddService({ services, setServices }) {
  const navigation = useNavigation();
  const route = useRoute();
  
  const editService = route.params?.editService;
  const isEditing = !!editService;

  const [serviceName, setServiceName] = useState(editService?.title || '');
  const [category, setCategory] = useState(editService?.category || '');
  const [duration, setDuration] = useState(editService?.duration?.toString() || '');
  const [price, setPrice] = useState(editService?.price?.toString() || '');
  const [description, setDescription] = useState(editService?.description || '');
  const [staff, setStaff] = useState(editService?.staff || '');
  const [image, setImage] = useState(editService?.image || null);
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);

  // Popup Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'default',
    buttonText: 'OK',
    buttonAction: null,
    secondButtonText: null,
    secondButtonAction: null,
  });

  // Fetch staff list from API
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/staff`);
        if (response.ok) {
          const data = await response.json();
          setStaffList(Array.isArray(data) ? data : []);
        } else {
          console.error('Failed to fetch staff:', response.status);
          setStaffList([]);
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
        setStaffList([]);
      }
    };

    fetchStaff();
  }, []);

  const showAlert = (config) => {
    setAlertConfig({
      visible: true,
      buttonText: 'OK',
      buttonAction: null,
      secondButtonText: null,
      secondButtonAction: null,
      ...config,
    });
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const handleSave = async () => {
    // Validation
    if (!serviceName.trim() || !price.trim()) {
      showAlert({
        title: 'Validation Error',
        message: 'Service name and price are required fields.',
        type: 'error',
      });
      return;
    }

    if (isNaN(parseFloat(price))) {
      showAlert({
        title: 'Invalid Price',
        message: 'Please enter a valid price.',
        type: 'error',
      });
      return;
    }

    if (duration && isNaN(parseInt(duration))) {
      showAlert({
        title: 'Invalid Duration',
        message: 'Please enter a valid duration in minutes.',
        type: 'error',
      });
      return;
    }

    // Disable save button during processing
    setLoading(true);

    const serviceData = {
      title: serviceName.trim(),
      category: category.trim() || null,
      duration: duration ? parseInt(duration) : null,
      price: parseFloat(price),
      description: description.trim() || null,
      staff: staff.trim() || null,
      image: typeof image === 'string' ? image : null, // Ensure URI string
    };

    try {
      let response;
      
      if (isEditing) {
        // Update existing service
        response = await fetch(`${API_BASE_URL}/api/services/${editService.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(serviceData),
        });
      } else {
        // Add new service
        response = await fetch(`${API_BASE_URL}/api/services`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(serviceData),
        });
      }

      if (response.ok) {
        // Optional: Update local state if setServices is provided
        if (setServices && services && Array.isArray(services)) {
          if (isEditing) {
            const updatedServices = services.map(service =>
              service.id === editService.id ? { ...service, ...serviceData } : service
            );
            setServices(updatedServices);
          } else {
            // For new service, we'd need the returned ID—rely on refresh instead
            setServices([...services, { ...serviceData, id: Date.now() }]); // Temp ID
          }
        }

        // Show success and navigate back with refresh flag
        showAlert({
          title: 'Success',
          message: isEditing ? 'Service updated successfully!' : 'Service added successfully!',
          type: 'success',
          buttonAction: () => {
            closeAlert();
            navigation.navigate('ManageServices', { 
              refresh: true, 
              timestamp: Date.now() 
            });
          },
        });
      } else {
        const data = await response.json().catch(() => ({}));
        showAlert({
          title: 'Server Error',
          message: data.message || 'Failed to save service. Please try again.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error saving service:', error);
      showAlert({
        title: 'Connection Error',
        message: 'Unable to connect to server. Please check your connection and try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web fallback (no ImagePicker)
        setImage('https://via.placeholder.com/300x169?text=Service+Image');
        showAlert({
          title: 'Image Added',
          message: 'Placeholder image added successfully!',
          type: 'info',
        });
        return;
      }

      // Request permission (mobile)
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert({
          title: 'Permission Required',
          message: 'We need camera roll permissions to upload images.',
          type: 'info',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        showAlert({
          title: 'Image Selected',
          message: 'Image uploaded successfully!',
          type: 'success',
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showAlert({
        title: 'Upload Failed',
        message: 'Failed to upload image. Please try again.',
        type: 'error',
      });
    }
  };

  const handleCancel = () => {
    // Improved unsaved changes detection
    const hasChanges = 
      serviceName.trim() !== (editService?.title || '') ||
      category.trim() !== (editService?.category || '') ||
      duration.trim() !== (editService?.duration?.toString() || '') ||
      price.trim() !== (editService?.price?.toString() || '') ||
      description.trim() !== (editService?.description || '') ||
      staff.trim() !== (editService?.staff || '') ||
      image !== (editService?.image || null);
    
    if (hasChanges) {
      showAlert({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to go back?',
        type: 'info',
        buttonText: 'Yes, Go Back',
        buttonAction: () => {
          closeAlert();
          navigation.goBack();
        },
        secondButtonText: 'Continue Editing',
        secondButtonAction: closeAlert,
      });
    } else {
      navigation.goBack();
    }
  };

  const categories = [
    'Hair Cut & Styling',
    'Hair Coloring',
    'Hair Treatment',
    'Facial & Skincare',
    'Nail Care',
    'Body Treatment',
    'Makeup',
    'Spa & Wellness',
    'Other'
  ];

  const isSaveDisabled = loading || !serviceName.trim() || !price.trim() || isNaN(parseFloat(price));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.heading}>
          {isEditing ? 'Edit Service' : 'Add New Service'}
        </Text>
        <Text style={styles.subheading}>
          {isEditing ? 'Update service details' : 'Fill in the details below'}
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Service Name *</Text>
        <TextInput
          style={styles.input}
          value={serviceName}
          onChangeText={setServiceName}
          placeholder="Enter service name"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Category</Text>
        {Platform.OS === 'web' ? (
          <select
            style={styles.webSelect}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        ) : (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={styles.picker}
              enabled={true}
            >
              <Picker.Item label="Select Category" value="" />
              {categories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>
        )}

        <Text style={styles.label}>Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
          placeholder="Enter duration (e.g., 30)"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Price (₹) *</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
          placeholder="Enter price (e.g., 500)"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter service description"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Service Image</Text>
        <TouchableOpacity style={styles.imageContainer} onPress={handleImageUpload} disabled={loading}>
          {image ? (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: image }} style={styles.image} />
              <View style={styles.imageOverlay}>
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.imageOverlayText}>Change Image</Text>
              </View>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={40} color="#999" />
              <Text style={styles.imagePlaceholderText}>Tap to upload image</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Staff Member</Text>
        {Platform.OS === 'web' ? (
          <select
            style={styles.webSelect}
            value={staff}
            onChange={(e) => setStaff(e.target.value)}
            disabled={staffList.length === 0}
          >
            <option value="">Select Staff Member</option>
            {staffList.map((member) => (
              <option 
                key={member.id} 
                value={member.full_name || member.name || ''}
              >
                {member.full_name || member.name || 'Unknown'}
              </option>
            ))}
          </select>
        ) : (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={staff}
              onValueChange={setStaff}
              style={styles.picker}
              enabled={staffList.length > 0}
            >
              <Picker.Item label="Select Staff Member" value="" />
              {staffList.map((member) => (
                <Picker.Item 
                  key={member.id} 
                  label={member.full_name || member.name || 'Unknown'} 
                  value={member.full_name || member.name || ''} 
                />
              ))}
            </Picker>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.saveButton, isSaveDisabled && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={isSaveDisabled}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.saveButtonText}>Saving...</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Update Service' : 'Add Service'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleCancel}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <PopupAlert {...alertConfig} onClose={closeAlert} />
      </View> 
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8faff' 
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#6C3483',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c1810',
    marginBottom: 4,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
  },
  form: {
    paddingHorizontal: 20,
  },
  label: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginTop: 20,
    marginBottom: 8,
    color: '#2c1810',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#e1e1e1',
  borderRadius: 12,
  paddingHorizontal: 16,   
  height: 56,              
  justifyContent: 'center', 
  marginBottom: 16,        
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
},
picker: {
  fontSize: 16,     
  color: '#333',   
},
imageContainer: {
    marginTop: 8,
    marginBottom: 10,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: { 
    width: '100%', 
    height: 150, 
    borderRadius: 12,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageOverlayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  imagePlaceholder: {
    height: 150,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e1e1e1',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#999',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  saveButton: {
    backgroundColor: '#6C3483',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6C3483',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 16,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#6C3483',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6C3483',
    fontWeight: '600',
    fontSize: 16,
  },
  webSelect: {
  width: '100%',
  height: 56,
  borderWidth: 1,
  borderColor: '#e1e1e1',
  borderRadius: 12,
  paddingHorizontal: 16,
  fontSize: 16,
  color: '#333',
  backgroundColor: '#fff',
  marginBottom: 16,
  boxShadow: '0px 2px 4px rgba(0,0,0,0.05)', 
},
});