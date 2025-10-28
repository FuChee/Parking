// App.js
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { UserProvider, UserContext } from './src/context/UserContext';

import HomeScreen from './src/screens/HomeScreen';
import SavedLocationScreen from './src/screens/SavedLocationScreen';
import LocationDetailScreen from './src/screens/LocationDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import FirstScreen from './src/screens/FirstScreen';

const Stack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const SavedStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator
      screenOptions={{ headerTitleAlign: 'center', headerTitleStyle: { fontWeight: 'bold' } }}
    >
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: 'Profile' }} />
      <ProfileStack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
      <ProfileStack.Screen name="SignUp" component={SignupScreen} options={{ title: 'Sign Up' }} />
    </ProfileStack.Navigator>
  );
}

function SavedStackScreen() {
  return (
    <SavedStack.Navigator
      screenOptions={{ headerTitleAlign: 'center', headerTitleStyle: { fontWeight: 'bold' } }}
    >
      <SavedStack.Screen name="SavedLocations" component={SavedLocationScreen} options={{ title: 'Saved Locations' }} />
      <SavedStack.Screen name="LocationDetail" component={LocationDetailScreen} options={{ title: 'Location Detail' }} />
    </SavedStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'car-sport' : 'car-sport-outline';
          else if (route.name === 'Saved') iconName = focused ? 'bookmark' : 'bookmark-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Saved" component={SavedStackScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user } = React.useContext(UserContext);

  return user ? (
    <MainTabs />
  ) : (
    <Stack.Navigator
      screenOptions={{ headerTitleAlign: 'center', headerTitleStyle: { fontWeight: 'bold' } }}
    >
      <Stack.Screen name="First" component={FirstScreen} options={{ headerShown: false}} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
      <Stack.Screen name="SignUp" component={SignupScreen} options={{ title: 'Sign Up' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <UserProvider>
          <NavigationContainer>
            <RootNavigator />  
          </NavigationContainer>
        </UserProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}