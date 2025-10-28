// src/screens/ProfileScreen.js
import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { UserContext } from '../context/UserContext';
import { useUpdateProfileMutation } from '../profile/profileApi';

export default function ProfileScreen({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const handleLogout = () => {
    setUser(null);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!editedName.trim() || !editedEmail.trim()) {
      Alert.alert('Error', 'Name and email cannot be empty.');
      return;
    }

    try {
      const { data } = await updateProfile({
        user_id: user.id, 
        name: editedName,
        email: editedEmail,
      }).unwrap();

      setUser({ ...user, name: editedName, email: editedEmail });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (err) {
      console.error('Error updating profile:', err);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.profileTitle}>My Profile</Text>

        <View style={styles.infoBlock}>
          <Text style={styles.label}>Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Enter your name"
            />
          ) : (
            <Text style={styles.infoText}>{user?.name}</Text>
          )}
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.label}>Email</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedEmail}
              onChangeText={setEditedEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
            />
          ) : (
            <Text style={styles.infoText}>{user?.email}</Text>
          )}
        </View>
      </View>

      {isEditing ? (
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.button, styles.editButton]} onPress={handleEditToggle}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 40,
    marginBottom: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },

  profileTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#5C4E33',
    marginBottom: 30,
    textAlign: 'center',
  },

  infoBlock: {
    width: '80%',
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7A7050',
    marginBottom: 4,
  },

  infoText: {
    fontSize: 17,
    color: '#3B3B3B',
    marginTop: 6,
  },

  input: {
    width: '100%',
    fontSize: 16,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#B5A67A',
    borderRadius: 10,
    backgroundColor: '#fff',
  },

  button: {
    width: '80%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  editButton: {
    backgroundColor: '#7A7050',
  },

  saveButton: {
    backgroundColor: '#0BA467',
  },

  logoutButton: {
    backgroundColor: '#C75B5B',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
