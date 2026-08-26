import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExploreScreen } from '../screens/ExploreScreen';
import { SafetyCheckScreen } from '../screens/SafetyCheckScreen';
import { PFZScreen } from '../screens/PFZScreen';
import { AskMarisScreen } from '../screens/AskMarisScreen';
import { CitizenReportScreen } from '../screens/CitizenReportScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { theme } from '../theme/theme';
import { Compass, ShieldCheck, Anchor, Bot, ShieldAlert, User } from 'lucide-react-native';

export type RootTabParamList = {
  Explore: undefined;
  Safety: undefined;
  PFZ: undefined;
  AskMaris: undefined;
  Report: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator();

const renderExploreIcon = ({ color, size }: { color: string; size: number }) => <Compass color={color} size={size} />;
const renderSafetyIcon = ({ color, size }: { color: string; size: number }) => <ShieldCheck color={color} size={size} />;
const renderPFZIcon = ({ color, size }: { color: string; size: number }) => <Anchor color={color} size={size} />;
const renderAskIcon = ({ color, size }: { color: string; size: number }) => <Bot color={color} size={size} />;
const renderReportIcon = ({ color, size }: { color: string; size: number }) => <ShieldAlert color={color} size={size} />;
const renderProfileIcon = ({ color, size }: { color: string; size: number }) => <User color={color} size={size} />;

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface, elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { fontWeight: '800', fontSize: 16, color: theme.colors.textPrimary },
        headerTintColor: theme.colors.textPrimary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ title: 'MARIS Coastal', tabBarLabel: 'Explore', tabBarIcon: renderExploreIcon }}
      />
      <Tab.Screen
        name="Safety"
        component={SafetyCheckScreen}
        options={{ title: 'Coastal Safety', tabBarLabel: 'Safety Check', tabBarIcon: renderSafetyIcon }}
      />
      <Tab.Screen
        name="PFZ"
        component={PFZScreen}
        options={{ title: 'Fishing Zones', tabBarLabel: 'PFZ Map', tabBarIcon: renderPFZIcon }}
      />
      <Tab.Screen
        name="AskMaris"
        component={AskMarisScreen}
        options={{ title: 'MARIS AI Safety', tabBarLabel: 'Ask AI', tabBarIcon: renderAskIcon }}
      />
      <Tab.Screen
        name="Report"
        component={CitizenReportScreen}
        options={{ title: 'Public Tipster', tabBarLabel: 'Report Tip', tabBarIcon: renderReportIcon }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Citizen Account', tabBarLabel: 'Account', tabBarIcon: renderProfileIcon }}
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
