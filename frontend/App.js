import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-datepicker/dist/react-datepicker.css';

// Import all screens
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import DashboardScreen from './DashboardScreen';
import ManageStaffScreen from './ManageStaffScreen';
import AddStaffScreen from './AddStaffScreen';
import DeleteStaffScreen from './DeleteStaffScreen';
import ViewStaffScreen from './ViewStaffScreen';
import ManageAppointmentsScreen from './ManageAppointmentsScreen';
import AddAppointmentScreen from './AddAppointmentScreen';
import ManageServicesScreen from './ManageServicesScreen';
import AddService from './AddService';

const Stack = createNativeStackNavigator();

export default function App() {
  // State to hold all services
  const [services, setServices] = useState([]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="ManageStaff" component={ManageStaffScreen} />
        <Stack.Screen name="AddStaff" component={AddStaffScreen} />
        <Stack.Screen name="DeleteStaff" component={DeleteStaffScreen} />
        <Stack.Screen name="ViewStaff" component={ViewStaffScreen} />
        <Stack.Screen name="ManageAppointments" component={ManageAppointmentsScreen} />
        <Stack.Screen name="AddAppointment" component={AddAppointmentScreen} />

        {/* Safely pass services state as props */}
        <Stack.Screen
          name="ManageServices"
          children={(props) => (
            <ManageServicesScreen
              {...props}
              services={services}
              setServices={setServices}
            />
          )}
        />

        <Stack.Screen
          name="AddService"
          children={(props) => (
            <AddService
              {...props}
              services={services}
              setServices={setServices}
            />
          )}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
