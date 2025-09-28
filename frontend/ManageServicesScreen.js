import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  Platform,
  RefreshControl,
  Dimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PopupAlert from './PopupAlert'; // Adjust the import path as needed

const { width } = Dimensions.get('window');
const API_URL = 'http://192.168.106.225:5000/api/services';

export default function ManageServicesScreen({ services: propServices, setServices: setPropServices }) {
  console.log(' COMPONENT STARTING - ManageServicesScreen');

  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [renderStep, setRenderStep] = useState('initial');
  
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

  console.log(' Current State:', {
    services: services.length,
    loading,
    error,
    refreshing,
    renderStep,
    propServices: propServices?.length || 'none'
  });

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
const fetchServices = async () => {
  console.log(' fetchServices called');
  setRenderStep('fetching');

  try {
    setError(null);
    console.log('📡 Making request to:', API_URL);

    const response = await fetch(API_URL);
    console.log('✅ Response received:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(' Data received:', data);

    // FIX: handle { success: true, services: [] }
    if (Array.isArray(data.services)) {
      setServices(data.services);
      console.log('✅ Services set successfully:', data.services.length, 'items');
      setRenderStep('success');

      if (setPropServices) {
        setPropServices(data.services);
      }
    } else {
      console.warn('⚠️ No services array found in response');
      setServices([]);
      setRenderStep('empty');
    }

  } catch (error) {
    console.error('❌ Fetch error:', error);
    setError(error.message);
    setRenderStep('error');

    if (propServices && Array.isArray(propServices)) {
      console.log(' Using fallback services');
      setServices(propServices);
    }

    showAlert({
      title: 'Connection Error',
      message: `Failed to load services: ${error.message}`,
      type: 'error',
    });
  } finally {
    setLoading(false);
    setRefreshing(false);
    console.log(' fetchServices completed');
  }
};

  useEffect(() => {
    console.log(' useEffect triggered');
    fetchServices();
  }, []);

  const onRefresh = () => {
    console.log('Pull to refresh');
    setRefreshing(true);
    fetchServices();
  };

  const handleDelete = async (id, title) => {
  showAlert({
    title: 'Delete Service',
    message: `Are you sure you want to delete "${title}"?`,
    type: 'error',
    buttonText: 'Delete',
    buttonAction: async () => {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          const updatedServices = services.filter(service => service.id !== id);
          setServices(updatedServices);
          if (setPropServices) setPropServices(updatedServices);

          closeAlert();
          showAlert({
            title: 'Success',
            message: data.message || 'Service deleted successfully',
            type: 'success',
          });
        } else {
          closeAlert();
          showAlert({
            title: 'Error',
            message: data.message || 'Failed to delete service',
            type: 'error',
          });
        }
      } catch (error) {
        console.error('Delete error:', error);
        closeAlert();
        showAlert({
          title: 'Error',
          message: 'Something went wrong while deleting',
          type: 'error',
        });
      }
    },
    secondButtonText: 'Cancel',
    secondButtonAction: closeAlert,
  });
};


  const renderService = ({ item, index }) => {
    console.log(` Rendering service ${index}:`, item?.title || 'No title');
    
    return (
      <View style={[styles.card, { opacity: loading ? 0.7 : 1 }]}>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{item.title || 'Untitled Service'}</Text>
              {item.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              )}
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceSymbol}>₹</Text>
              <Text style={styles.price}>{item.price || '0'}</Text>
            </View>
          </View>
          
          <View style={styles.serviceDetails}>
            {item.duration && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>⏱️</Text>
                <Text style={styles.detailText}>{item.duration} min</Text>
              </View>
            )}
            
            {item.staff && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>👤</Text>
                <Text style={styles.detailText}>{item.staff}</Text>
              </View>
            )}
          </View>
          
          {item.description && (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {
              console.log(' Edit pressed for:', item.id);
              navigation.navigate('AddService', { editService: item });
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id, item.title)}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    console.log(' Rendering empty component');
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Services Available</Text>
        <Text style={styles.emptySubtext}>
          {error ? 'Unable to load services at the moment' : 'Use the "Add Service" button below to create your first service'}
        </Text>
      </View>
    );
  };

  const renderHeader = () => {
    console.log('Rendering header');
    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text style={styles.header}>Service Management</Text>
          <Text style={styles.subHeader}>
            {!loading && services.length > 0 && `${services.length} service${services.length !== 1 ? 's' : ''} available`}
          </Text>
        </View>
      </View>
    );
  };

  const renderAddButton = () => {
    return (
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={styles.floatingAddButton}
          onPress={() => {
            console.log('➕ Add Service pressed');
            navigation.navigate('AddService');
          }}
          activeOpacity={0.9}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Add Service</Text>
        </TouchableOpacity>
      </View>
    );
  };

  console.log(' About to render component');

  // Show loading state
  if (loading && !refreshing) {
    console.log('Showing loading state');
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#6C3483" />
            <Text style={styles.loadingText}>Loading services...</Text>
            <Text style={styles.loadingSubtext}>Please wait</Text>
          </View>
        </View>
        <PopupAlert
          {...alertConfig}
          onClose={closeAlert}
        />
      </View>
    );
  }

  console.log('Rendering main component');

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <FlatList
        data={services}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        renderItem={renderService}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#6C3483']}
            tintColor="#6C3483"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={services.length === 0 ? styles.emptyListContainer : styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      
      {renderAddButton()}
      
      <PopupAlert
        {...alertConfig}
        onClose={closeAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8faff',
  },
  headerContainer: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#6C3483',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    marginBottom: 0,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c1810',
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 14,
    color: '#8e8e93',
    fontWeight: '500',
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  floatingAddButton: {
    backgroundColor: '#6C3483',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#6C3483',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButton: {
    backgroundColor: '#6C3483',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#6C3483',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  addButtonText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 16,
  },
  listContent: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  separator: {
    height: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100, // Extra padding for floating button
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingContent: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#2c1810',
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#8e8e93',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6C3483',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f0f0f5',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#2c1810',
    marginBottom: 8,
    lineHeight: 24,
  },
  categoryBadge: {
    backgroundColor: '#f0e6ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#6C3483',
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  priceSymbol: {
    fontSize: 12,
    color: '#2E8B57',
    fontWeight: '500',
  },
  price: {
    fontSize: 24,
    color: '#2E8B57',
    fontWeight: '700',
  },
  serviceDetails: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  detailLabel: {
    fontSize: 12,
    marginRight: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#5a5a5f',
    fontWeight: '500',
  },
  description: { 
    fontSize: 15, 
    color: '#6b6b70', 
    lineHeight: 22,
  },
  cardActions: { 
    flexDirection: 'row',
    backgroundColor: '#f8faff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    justifyContent: 'flex-end',
  },
  editButton: { 
    backgroundColor: '#6C3483', 
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#6C3483',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    minWidth: 80,
  },
  editButtonText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 12,
  },
  deleteButton: { 
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  deleteButtonText: { 
    color: '#ff6b6b', 
    fontWeight: '600',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c1810',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 20,
  },
});