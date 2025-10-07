import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Alert, Vibration } from 'react-native';

const COUNTDOWN_SECONDS = 10;
const DANGER_COLOR = '#FF0000';
const VIBRATION_PATTERN = [0, 500, 500, 500]; // Vibrate for 500ms, pause for 500ms, repeat

export default function CountdownScreen({ onCancel, onTimeout }) {
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    // Start vibration when the screen loads
    Vibration.vibrate(VIBRATION_PATTERN, true); // `true` makes it repeat

    if (seconds > 0) {
      const timerId = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000);

      // Clean up the timer when the component unmounts
      return () => clearInterval(timerId);
    } else {
      // Countdown finished
      Vibration.cancel(); // Stop vibration
      onTimeout(); // Call the function to trigger the emergency alert
    }
  }, [seconds]);

  const handleCancel = () => {
    Vibration.cancel(); // Stop vibration
    onCancel(); // Call the function to go back to the main screen
    Alert.alert("Alert Canceled", "The emergency alert has been stopped.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.alertText}>EMERGENCY DETECTED</Text>
      <Text style={styles.countdownText}>{seconds}</Text>
      <Pressable
        style={styles.cancelButton}
        onPress={handleCancel}
      >
        <Text style={styles.cancelButtonText}>CANCEL</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DANGER_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cancelButton: {
    marginTop: 40,
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 50,
  },
  cancelButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DANGER_COLOR,
  },
});