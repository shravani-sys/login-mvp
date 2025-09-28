import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-datepicker/dist/react-datepicker.css';

import LoginScreen from './LoginScreen.js';
import SignupScreen from './SignupScreen.js';
import DashboardScreen from './DashboardScreen.js';
import ManageStaffScreen from './ManageStaffScreen.js';
import AddStaffScreen from './AddStaffScreen.js';
import DeleteStaffScreen from './DeleteStaffScreen.js';
import ViewStaffScreen from './ViewStaffScreen.js';
import ManageAppointmentsScreen from './ManageAppointmentsScreen';
import AddAppointmentScreen from './AddAppointmentScreen';
import ManageServicesScreen from './ManageServicesScreen';
import AddService from './AddService'; 
import CalendarScreen from './CalendarScreen';

import NotificationScreen from './NotificationScreen';

const Stack = createNativeStackNavigator();

export default function App() {
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
        <Stack.Screen 
          name="Calendar" 
          component={CalendarScreen} 
          options={{ headerShown: false }} 
        />

        {/* ✅ Add Notification Screen */}
        <Stack.Screen 
          name="Notifications" 
          component={NotificationScreen} 
          options={{ headerShown: false }} 
        />

        {/* Pass services & setServices to ManageServices */}
        <Stack.Screen name="ManageServices">
          {(props) => (
            <ManageServicesScreen
              {...props}
              services={services}
              setServices={setServices}
            />
          )}
        </Stack.Screen>

        {/* Pass services & setServices to AddService */}
        <Stack.Screen name="AddService">
          {(props) => (
            <AddService
              {...props}
              services={services}
              setServices={setServices}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
