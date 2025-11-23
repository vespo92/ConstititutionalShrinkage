import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/theme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

/**
 * Root Layout
 * Handles app initialization, authentication state, and navigation structure
 */
export default function RootLayout() {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    async function initializeApp() {
      try {
        // Initialize authentication state from secure storage
        await initialize();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    initializeApp();
  }, [initialize]);

  if (isLoading) {
    return null; // Splash screen is still visible
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary[700],
          },
          headerTintColor: colors.text.inverse,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: colors.background.secondary,
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="auth/login"
          options={{
            title: 'Sign In',
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="auth/register"
          options={{
            title: 'Create Account',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="auth/forgot-password"
          options={{
            title: 'Reset Password',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="bill/[id]"
          options={{
            title: 'Bill Details',
          }}
        />
        <Stack.Screen
          name="vote/[sessionId]"
          options={{
            title: 'Cast Your Vote',
            presentation: 'modal',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
