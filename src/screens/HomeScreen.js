import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  TextInput,
  Modal,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { UserContext } from '../context/UserContext';
import { useSaveParkingSlotMutation } from '../features/parkingApi';

export default function HomeScreen() {
  const { user } = useContext(UserContext);
  const [saveParkingSlot, { isLoading: saving }] = useSaveParkingSlotMutation();

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [updating, setUpdating] = useState(false); 
  const [modalVisible, setModalVisible] = useState(false);
  const [slotLevel, setSlotLevel] = useState('');
  const [slotNumber, setSlotNumber] = useState('');

  const watchId = useRef(null);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Parking Finder needs access to your location',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const startTrackingLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location access is required.');
      return;
    }

    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization('whenInUse');
    }

    setLoading(true);

    watchId.current = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, altitude } = position.coords;

        setUpdating(true);
        setLocation({ latitude, longitude, elevation: altitude ?? 0 });
        setTimeout(() => setUpdating(false), 800); 

        setLoading(false); 
      },
      (error) => {
        console.error('Geolocation Error:', error);
        setLoading(false);
        Alert.alert('Error', `Unable to get location: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 0,
        interval: 3000, 
        fastestInterval: 3000,
      }
    );
  };

  useEffect(() => {
    startTrackingLocation();

    return () => {
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  const saveSlotNumber = async () => {
    if (!slotLevel.trim() || !slotNumber.trim()) {
      Alert.alert('Missing Details', 'Please fill in both level and slot number.');
      return;
    }

    setModalVisible(false);

    try {
      await saveParkingSlot({
        userId: user?.id,
        slotLevel,
        slotNumber,
        latitude: location?.latitude,
        longitude: location?.longitude,
        elevation: location?.elevation,
      }).unwrap();

      Alert.alert(
        'Saved Successfully',
        `Your parking location (Level ${slotLevel}, Slot ${slotNumber}) has been saved.`
      );

      setSlotLevel('');
      setSlotNumber('');
    } catch (error) {
      console.error('Error saving slot:', error);
      Alert.alert('Error', 'Failed to save location. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parking Finder</Text>
      <Text style={styles.subtitle}>Save your parking location</Text>

      <TouchableOpacity
        style={[styles.button, loading && { backgroundColor: '#d0b084' }]}
        onPress={() => setModalVisible(true)}
        disabled={loading || !location}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save My Location</Text>}
      </TouchableOpacity>

      {location && (
        <View style={styles.locationBox}>
          <View style={styles.locationHeaderContainer}>
            <Text style={styles.locationHeader}>📍 Current Location</Text>
            {updating && <ActivityIndicator size="small" color="#5C4E33" style={{ marginLeft: 8 }} />}
          </View>

          <Text style={styles.locationText}>Latitude: {location.latitude?.toFixed(6) ?? 'N/A'}</Text>
          <Text style={styles.locationText}>Longitude: {location.longitude?.toFixed(6) ?? 'N/A'}</Text>
          <Text style={styles.locationText}>Elevation: {location.elevation?.toFixed(2) ?? 'N/A'} m</Text>
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Enter Parking Slot</Text>
            <TextInput style={styles.input} placeholder="Level" value={slotLevel} onChangeText={setSlotLevel} />
            <TextInput style={styles.input} placeholder="Slot number" value={slotNumber} onChangeText={setSlotNumber} />
            <TouchableOpacity style={styles.modalButton} onPress={saveSlotNumber}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#ddd', marginTop: 10 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.buttonText, { color: '#4a3f2f' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },

  title: { 
    fontSize: 30, 
    fontWeight: '700', 
    color: '#5C4E33', 
    marginBottom: 6 
  },

  subtitle: { 
    fontSize: 16, 
    color: '#7A6F56', 
    marginBottom: 30, 
    textAlign: 'center' 
  },

  button: {
    backgroundColor: '#0BA467',
    paddingVertical: 16,
    borderRadius: 14,
    marginVertical: 8,
    alignItems: 'center',
    width: '70%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 4,
  },

  buttonText: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: '600', 
    letterSpacing: 0.3 
  },

  locationBox: {
    marginTop: 35,
    backgroundColor: '#FFF9EE',
    padding: 20,
    borderRadius: 16,
    width: '90%',
    borderWidth: 1,
    borderColor: '#E6DDC4',
  },

  locationHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10, 
  },

  locationHeader: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#5C4E33' 
  },

  locationText: { 
    fontSize: 16, 
    color: '#3F3B2B', 
    marginBottom: 5 
  },

  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.4)' 
  },

  modalBox: { 
    backgroundColor: '#FFF9EE', 
    padding: 25, 
    borderRadius: 16, 
    width: '85%', 
    shadowColor: '#000', 
    shadowOpacity: 0.2, 
    shadowOffset: { width: 0, height: 3 }, 
    shadowRadius: 5 
  },

  modalTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#5C4E33', 
    textAlign: 'center', 
    marginBottom: 18 
  },

  input: { 
    borderWidth: 1, 
    borderColor: '#B5A67A', 
    borderRadius: 10, 
    padding: 12, 
    backgroundColor: '#FFFFFF', 
    marginBottom: 15, 
    fontSize: 16 
  },

  modalButton: { 
    backgroundColor: '#8B7E66', 
    paddingVertical: 14, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
});