import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_THRESHOLD = 5;

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
        console.error('Failed to load threshold.', e);
      }
    })();
  }, []);

  const saveThreshold = async () => {
    const numericValue = parseFloat(motionThreshold);
    if (isNaN(numericValue) || numericValue <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid number greater than 0.");
      return;
    }
    try {
      await AsyncStorage.setItem('motionThreshold', String(numericValue));
      onSave(numericValue);
      Alert.alert("Success", "Motion threshold saved!");
    } catch (e) {
      console.error('Failed to save threshold.', e);
      Alert.alert("Error", "Failed to save settings.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <Text style={styles.label}>Motion Detection Threshold</Text>
      <TextInput
        style={styles.input}
        onChangeText={setMotionThreshold}
        value={motionThreshold}
        keyboardType="numeric"
        placeholder="e.g., 5"
      />
      <Button title="Save Settings" onPress={saveThreshold} />
      <View style={{ marginTop: 20 }}>
        <Button title="Back to App" onPress={onBack} color="#841584" />
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
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '80%',
    textAlign: 'center',
    marginBottom: 20,
    borderRadius: 5,
  },
});