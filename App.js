import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Switch, Alert, Button } from 'react-native';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CountdownScreen from './CountdownScreen';
import SettingsScreen from './SettingsScreen';
import ContactsScreen from './ContactsScreen'; // Preserved Contact Screen

// ⚠️ IMPORTANT: Change this IP to match your current Wi-Fi IPv4 address!
const BACKEND_URL = 'http://172.25.3.96:3000/alert';
const DEFAULT_THRESHOLD = 5;

export default function App() {
  const [isProtectionMode, setIsProtectionMode] = useState(false);
  const [isEmergencyDetected, setIsEmergencyDetected] = useState(false);
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [locationPermission, setLocationPermission] = useState(null);
  
  const [isSettingsMode, setIsSettingsMode] = useState(false);
  const [isContactsMode, setIsContactsMode] = useState(false); // Preserved State
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);

  useEffect(() => {
    (async () => {
      // 1. Request ONLY location permissions (Removed Camera/Mic)
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(locationStatus === 'granted');

      if (locationStatus !== 'granted') {
        Alert.alert(
          "Permissions Required",
          "PulseSafe needs location permissions to function."
        );
      }
    })();

    // Load saved threshold on app start
    (async () => {
      try {
        const savedThreshold = await AsyncStorage.getItem('motionThreshold');
        if (savedThreshold !== null) {
          setThreshold(parseFloat(savedThreshold));
        }
      } catch (e) {
        console.error('Failed to load threshold.', e);
      }
    })();
  }, []);

  // 2. Monitor Accelerometer
  useEffect(() => {
    if (isProtectionMode && !isEmergencyDetected) {
      const subscription = Accelerometer.addListener(accelerometerData => {
        setAccelerometerData(accelerometerData);
      });
      Accelerometer.setUpdateInterval(100);

      return () => {
        subscription.remove();
      };
    } else {
      setAccelerometerData({ x: 0, y: 0, z: 0 });
    }
  }, [isProtectionMode, isEmergencyDetected]);

  // 3. Evaluate Crash Threshold
  useEffect(() => {
    if (isProtectionMode && !isEmergencyDetected) {
      const { x, y, z } = accelerometerData;
      const totalForce = Math.sqrt(x * x + y * y + z * z);

      if (totalForce > threshold) {
        console.log("Motion spike detected! totalForce:", totalForce);
        setIsEmergencyDetected(true);
      }
    }
  }, [accelerometerData, isProtectionMode, isEmergencyDetected, threshold]);

  const toggleSwitch = () => {
    if (locationPermission) {
      setIsProtectionMode(previousState => !previousState);
    } else {
      Alert.alert(
        "Permissions Denied",
        "Please enable location permissions to activate PulseSafe."
      );
    }
  };

  const handleCancel = () => {
    setIsEmergencyDetected(false);
    setIsProtectionMode(false);
  };

  // 4. Send Lightweight Telemetry Packet (No Video/Audio)
  const handleTimeout = async () => {
    console.log("Countdown finished. Capturing location and sending alert...");
    
    try {
      const location = await Location.getCurrentPositionAsync({});
      console.log('Location:', `${location.coords.latitude},${location.coords.longitude}`);

      // Bundle only GPS and Timestamp
      const formData = new FormData();
      formData.append('latitude', location.coords.latitude);
      formData.append('longitude', location.coords.longitude);
      formData.append('timestamp', new Date().toISOString());
      
      const response = await axios.post(BACKEND_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000, // Reduced timeout since we aren't sending large files
      });

      Alert.alert('Alert Sent!', 'Emergency alert has been sent with your location.');
      console.log('Backend response:', response.data);
      
    } catch (error) {
      console.error('Failed to send alert:', error);
      Alert.alert('Error', 'Failed to send alert. Please check your connection.');
    } finally {
      setIsEmergencyDetected(false);
      setIsProtectionMode(false);
    }
  };

  // Screen Routing
  if (isEmergencyDetected) {
    return <CountdownScreen onCancel={handleCancel} onTimeout={handleTimeout} />;
  }

  // Passing only the motion save function to settings
  if (isSettingsMode) {
    return <SettingsScreen onSave={setThreshold} onBack={() => setIsSettingsMode(false)} />;
  }

  // Routing to Contacts screen
  if (isContactsMode) {
    return <ContactsScreen onBack={() => setIsContactsMode(false)} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>PulseSafe</Text>
      
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleText}>Protection Mode</Text>
        <Switch
          onValueChange={toggleSwitch}
          value={isProtectionMode}
        />
      </View>

      {isProtectionMode && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Status: Active</Text>
          <Text style={styles.statusText}>Accelerometer Data:</Text>
          <Text style={styles.statusText}>x: {accelerometerData.x.toFixed(2)}</Text>
          <Text style={styles.statusText}>y: {accelerometerData.y.toFixed(2)}</Text>
          <Text style={styles.statusText}>z: {accelerometerData.z.toFixed(2)}</Text>
          <Text style={styles.statusText}>Force: {Math.sqrt(accelerometerData.x*accelerometerData.x + accelerometerData.y*accelerometerData.y + accelerometerData.z*accelerometerData.z).toFixed(2)}</Text>
          <Text style={styles.statusText}>Motion Threshold: {threshold.toFixed(2)}</Text>
        </View>
      )}

      {/* Navigation Buttons */}
      <View style={styles.settingsButtonContainer}>
        <Button title="Settings" onPress={() => setIsSettingsMode(true)} />
      </View>
      <View style={styles.contactsButtonContainer}>
        <Button title="Emergency Contacts" onPress={() => setIsContactsMode(true)} color="#27ae60" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toggleText: {
    fontSize: 20,
    marginRight: 10,
  },
  statusContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#555',
  },
  settingsButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  contactsButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
});