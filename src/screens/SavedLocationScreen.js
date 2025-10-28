import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { Swipeable } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  useGetParkingRecordsQuery,
  useDeleteParkingRecordMutation,
} from '../features/parkingApi';

export default function SavedLocationsScreen({ navigation }) {
  const { user } = useContext(UserContext);

  // RTK Query hooks
  const {
    data: locations = [],
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetParkingRecordsQuery(user?.id, { skip: !user });

  const [deleteParkingRecord] = useDeleteParkingRecordMutation();

  const handleDelete = async (id) => {
    try {
      await deleteParkingRecord(id).unwrap();
      Alert.alert('Deleted', 'Location has been deleted.');
      refetch();
    } catch (err) {
      console.error('Error deleting location:', err);
      Alert.alert('Error', 'Failed to delete location.');
    }
  };

  const renderRightActions = (itemId) => (
    <TouchableOpacity
      onPress={() => handleDelete(itemId)}
      activeOpacity={0.8}
      style={styles.deleteSwipe}
    >
      <Ionicons name="trash" size={28} color="#fff" />
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('LocationDetail', { location: item, refresh: refetch })
        }
      >
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="car-outline" size={20} color="#7A7050" style={styles.icon} />
            <Text style={styles.slotText}>Slot: {item.slot_number}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="layers-outline" size={20} color="#7A7050" style={styles.icon} />
            <Text style={styles.slotText}>Level: {item.level || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="navigate-outline" size={20} color="#7A7050" style={styles.icon} />
            <Text style={styles.text}>Lat: {item.latitude.toFixed(6)}</Text>
            <Text style={styles.text}>Lng: {item.longitude.toFixed(6)}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="speedometer-outline" size={20} color="#7A7050" style={styles.icon} />
            <Text style={styles.text}>Elevation: {item.elevation.toFixed(2)} m</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="time-outline" size={20} color="#7A7050" style={styles.icon} />
            <Text style={styles.text}>Saved: {new Date(item.created_at).toLocaleString()}</Text>
          </View>
          {item.left_at && (
            <View style={styles.row}>
              <Ionicons name="exit-outline" size={20} color="#7A7050" style={styles.icon} />
              <Text style={styles.text}>
                Left: {new Date(item.left_at).toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  // Loading / Error / Empty states
  if (isLoading || isFetching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#9E8F67" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={50} color="#C2B490" />
        <Text style={styles.emptyText}>Error loading locations</Text>
        <TouchableOpacity
          style={styles.loginPromptButton}
          onPress={() => refetch()}
        >
          <Text style={styles.loginPromptButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!locations.length) {
    return (
      <View style={styles.centered}>
        <Ionicons name="car-outline" size={50} color="#C2B490" style={{ marginBottom: 15 }} />
        <Text style={styles.emptyText}>No saved locations yet</Text>
        <Text style={styles.emptySubText}>Save your parking spot to see it here later</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3, 
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },

  icon: {
    marginRight: 8,
  },

  slotText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5B4C2D', 
  },

  text: {
    fontSize: 15,
    color: '#3F3B2B',
    marginRight: 12,
  },

  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#7A7050',
  },

  emptySubText: {
    fontSize: 15,
    color: '#A09373',
    textAlign: 'center',
    marginTop: 5,
    width: '75%',
  },

  deleteSwipe: {
    backgroundColor: '#D9534F',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 15,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },

  loginPromptButton: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 40,
    backgroundColor: '#A67B5B',
    borderRadius: 12,
  },

  loginPromptButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});