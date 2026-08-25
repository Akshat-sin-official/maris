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

import { Shield, MapPin, Bot, Eye, Bell, FileText, User as UserIcon } from 'lucide-react-native';

const renderHomeIcon = ({ color, size }: { color: string; size: number }) => <Shield color={color} size={size} />;
const renderMapIcon = ({ color, size }: { color: string; size: number }) => <MapPin color={color} size={size} />;
const renderAskIcon = ({ color, size }: { color: string; size: number }) => <Bot color={color} size={size} />;
const renderObserveIcon = ({ color, size }: { color: string; size: number }) => <Eye color={color} size={size} />;
const renderAlertsIcon = ({ color, size }: { color: string; size: number }) => <Bell color={color} size={size} />;
const renderReportsIcon = ({ color, size }: { color: string; size: number }) => <FileText color={color} size={size} />;
const renderProfileIcon = ({ color, size }: { color: string; size: number }) => <UserIcon color={color} size={size} />;

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface, elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { fontWeight: '700', fontSize: 16, color: theme.colors.textPrimary },
        headerTintColor: theme.colors.textPrimary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.colors.secondary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'MARIS',
          tabBarLabel: 'Overview',
          tabBarIcon: renderHomeIcon,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Live GIS Map',
          tabBarLabel: 'GIS Map',
          tabBarIcon: renderMapIcon,
        }}
      />
      <Tab.Screen
        name="AskMaris"
        component={AskMarisScreen}
        options={{
          title: 'Ask MARIS AI',
          tabBarLabel: 'Ask AI',
          tabBarIcon: renderAskIcon,
        }}
      />
      <Tab.Screen
        name="Observe"
        component={ObserveScreen}
        options={{
          title: 'Field Observation',
          tabBarLabel: 'Observe',
          tabBarIcon: renderObserveIcon,
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          title: 'Marine Advisories',
          tabBarLabel: 'Alerts',
          tabBarIcon: renderAlertsIcon,
        }}
      />
      <Tab.Screen
        name="MyReports"
        component={MyReportsScreen}
        options={{
          title: 'My Reports & Queue',
          tabBarLabel: 'Reports',
          tabBarIcon: renderReportsIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Officer Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: renderProfileIcon,
        }}
      />
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
