import React from 'react';
import { StatusBar, ActivityIndicator, Image, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { CurrencyProvider } from './src/context/CurrencyContext';
import { ExpenseProvider, useExpenses } from './src/context/ExpenseContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import { LockScreen } from './src/screens/LockScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { AddExpenseScreen } from './src/screens/AddExpenseScreen';
import { TransactionsScreen } from './src/screens/TransactionsScreen';
import { ReportsScreen } from './src/screens/ReportsScreen';
import { BudgetScreen } from './src/screens/BudgetScreen';
import { CategoriesScreen } from './src/screens/CategoriesScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AnimatedIcon = ({ name, color, focused }: { name: string; color: string; focused: boolean }) => {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.2 : 1, { damping: 12 });
  }, [focused]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Ionicons name={name as any} size={24} color={color} />
    </Animated.View>
  );
};

const TabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, focused }) => {
          let iconName = 'home';
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Transactions') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'AddExpense') iconName = 'add-circle';
          else if (route.name === 'Reports') iconName = focused ? 'pie-chart' : 'pie-chart-outline';
          else if (route.name === 'Budget') iconName = focused ? 'calculator' : 'calculator-outline';
          return <AnimatedIcon name={iconName} color={color} focused={focused} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{
          tabBarLabel: 'Add',
          tabBarIconStyle: { marginTop: -4 },
        }}
      />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Budget" component={BudgetScreen} />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
    </Stack.Navigator>
  );
};

const AppContent = () => {
  const { colors, isDark } = useTheme();
  const { isAuthenticated, isLockEnabled } = useAuth();
  const { loading } = useExpenses();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 24, backgroundColor: colors.background }}>
        <Image source={require('./assets/expense-tracker.png')} style={{ width: 200, height: 200 }} resizeMode="contain" />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <NavigationContainer>
        {isLockEnabled && !isAuthenticated ? <LockScreen /> : <MainNavigator />}
      </NavigationContainer>
      <Toast />
    </>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <CurrencyProvider>
          <AuthProvider>
            <ExpenseProvider>
              <AppContent />
            </ExpenseProvider>
          </AuthProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
