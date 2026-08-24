import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { MapScreen } from '../screens/MapScreen';
import { AskMarisScreen } from '../screens/AskMarisScreen';
import { ObserveScreen } from '../screens/ObserveScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import { MyReportsScreen } from '../screens/MyReportsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { theme } from '../theme/theme';

export type RootTabParamList = {
  Home: undefined;
  Map: undefined;
  AskMaris: undefined;
  Observe: undefined;
  Alerts: undefined;
  MyReports: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.textPrimary,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
        tabBarActiveTintColor: theme.colors.secondary,
        tabBarInactiveTintColor: theme.colors.textMuted,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'MARIS' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Live GIS' }} />
      <Tab.Screen name="AskMaris" component={AskMarisScreen} options={{ title: 'Ask AI' }} />
      <Tab.Screen name="Observe" component={ObserveScreen} options={{ title: 'Observe' }} />
      <Tab.Screen name="Alerts" component={AlertsScreen} options={{ title: 'Alerts' }} />
      <Tab.Screen name="MyReports" component={MyReportsScreen} options={{ title: 'Reports' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
    </Stack.Navigator>
  );
}
