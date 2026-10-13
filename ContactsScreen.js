import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BACKEND_URL = 'http://172.20.10.2:3000';

export default function ContactsScreen({ onBack }) {
  const [contacts, setContacts] = useState([
    { name: '', phone: '', method: 'sms' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/contacts`);
      if (response.data.contacts && response.data.contacts.length > 0) {
        setContacts(response.data.contacts);
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const addContact = () => {
    setContacts([...contacts, { name: '', phone: '', method: 'sms' }]);
  };

  const removeContact = (index) => {
    const newContacts = contacts.filter((_, i) => i !== index);
    setContacts(newContacts.length > 0 ? newContacts : [{ name: '', phone: '', method: 'sms' }]);
  };

  const updateContact = (index, field, value) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
  };

  const saveContacts = async () => {
    // Validate contacts
    const validContacts = contacts.filter(contact => 
      contact.name.trim() !== '' && contact.phone.trim() !== ''
    );

    if (validContacts.length === 0) {
      Alert.alert('Error', 'Please add at least one emergency contact with name and phone number.');
      return;
    }

    // Validate phone numbers (basic validation)
    for (const contact of validContacts) {
      if (!contact.phone.match(/^\+?[1-9]\d{1,14}$/)) {
        Alert.alert('Error', `Invalid phone number for ${contact.name}. Please include country code (e.g., +1234567890)`);
        return;
      }
    }

    setIsLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/contacts`, { contacts: validContacts });
      Alert.alert('Success', 'Emergency contacts saved successfully!');
    } catch (error) {
      console.error('Failed to save contacts:', error);
      Alert.alert('Error', 'Failed to save contacts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.header}>Emergency Contacts</Text>
      <Text style={styles.subtitle}>Add contacts who will receive alerts during emergencies</Text>
      
      {contacts.map((contact, index) => (
        <View key={index} style={styles.contactCard}>
          <View style={styles.contactHeader}>
            <Text style={styles.contactNumber}>Contact {index + 1}</Text>
            {contacts.length > 1 && (
              <TouchableOpacity 
                onPress={() => removeContact(index)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Contact Name"
            value={contact.name}
            onChangeText={(value) => updateContact(index, 'name', value)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Phone Number (with country code, e.g., +1234567890)"
            value={contact.phone}
            onChangeText={(value) => updateContact(index, 'phone', value)}
            keyboardType="phone-pad"
          />
          
          <View style={styles.methodContainer}>
            <Text style={styles.methodLabel}>Alert Method:</Text>
            <View style={styles.methodButtons}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  styles.methodButtonActive
                ]}
              >
                <Text style={[
                  styles.methodButtonText,
                  styles.methodButtonTextActive
                ]}>SMS</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.infoText}>All alerts sent via SMS (free tier)</Text>
          </View>
        </View>
      ))}
      
      <TouchableOpacity style={styles.addButton} onPress={addContact}>
        <Text style={styles.addButtonText}>+ Add Another Contact</Text>
      </TouchableOpacity>
      
      <View style={styles.buttonContainer}>
        <Button 
          title={isLoading ? "Saving..." : "Save Contacts"} 
          onPress={saveContacts}
          disabled={isLoading}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button title="Back to App" onPress={onBack} color="#841584" />
      </View>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📱 Setup Information</Text>
        <Text style={styles.infoText}>
          • SMS alerts work with any phone number
        </Text>
        <Text style={styles.infoText}>
          • Using Twilio free tier (no upgrades needed)
        </Text>
        <Text style={styles.infoText}>
          • Always include country code (+1 for US, +91 for India, etc.)
        </Text>
        <Text style={styles.infoText}>
          • Server admin must configure Twilio credentials
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  methodContainer: {
    marginTop: 10,
  },
  methodLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  methodButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  methodButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  methodButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  methodButtonText: {
    fontSize: 14,
    color: '#666',
  },
  methodButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginBottom: 15,
  },
  infoBox: {
    backgroundColor: '#e8f4fd',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
});
