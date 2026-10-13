import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_THRESHOLD = 5;
const DEFAULT_AUDIO_THRESHOLD = 80;

export default function SettingsScreen({ onSave, onBack }) {
  const [motionThreshold, setMotionThreshold] = useState(String(DEFAULT_THRESHOLD));

  useEffect(() => {
    (async () => {
      try {
        const savedThreshold = await AsyncStorage.getItem('motionThreshold');
        if (savedThreshold !== null) {
          setMotionThreshold(savedThreshold);
        }
      } catch (e) {
        console.error('Failed to load thresholds.', e);
      }
    })();
  }, []);

  const saveThresholds = async () => {
    const numericValue = parseFloat(motionThreshold);
    
    if (isNaN(numericValue) || numericValue <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid motion threshold greater than 0.");
      return;
    }
    
    try {
      await AsyncStorage.setItem('motionThreshold', String(numericValue));
      onSave(numericValue);
      Alert.alert("Success", "Settings saved successfully!");
    } catch (e) {
      console.error('Failed to save thresholds.', e);
      Alert.alert("Error", "Failed to save settings.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{alignItems: 'center'}}>
      <Text style={styles.header}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Motion Detection</Text>
        <Text style={styles.label}>Motion Detection Threshold</Text>
        <TextInput
          style={styles.input}
          onChangeText={setMotionThreshold}
          value={motionThreshold}
          keyboardType="numeric"
          placeholder="e.g., 5"
        />
        <Text style={styles.helpText}>Higher values make motion detection less sensitive</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button title="Save Settings" onPress={saveThresholds} />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button title="Back to App" onPress={onBack} color="#841584" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    textAlign: 'center',
    marginBottom: 10,
    borderRadius: 5,
  },
  helpText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
});