import { router, Stack, usePathname } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { SocketProvider } from './(tabs)/context/SocketContext';

const PROTECTED_ROUTES = [
  '/(tabs)/home',
  '/(tabs)/status',
  '/(tabs)/order-details',
  '/(tabs)/edit-profile',
  '/(tabs)/settings',
  '/(tabs)/messages',
];

const PUBLIC_ROUTES = [
  '/(auth)/Signin',
  '/(auth)/Signup',
  '/(auth)/Forgot_Password',
  '/(auth)/EmailVerification',
  '/(auth)/Onboarding',
  '/index',
];

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (!isAuthenticated && isProtectedRoute) {
      router.replace('/(auth)/Signin');
    } else if (isAuthenticated && isPublicRoute) {
      // Important: do NOT call dismissAll() here to avoid POP_TO_TOP warning
      router.replace('/(tabs)/home');
    }
  }, [isLoading, isAuthenticated, pathname]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  return <>{children}</>;
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SocketProvider>
          <ProtectedRoute>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)/Signin" />
              <Stack.Screen name="(auth)/Signup" />
              <Stack.Screen name="(auth)/Forgot_Password" />
              <Stack.Screen name="(auth)/EmailVerification" />
              <Stack.Screen name="(tabs)/home" />
              <Stack.Screen name="(tabs)/status" options={{ presentation: 'modal' }} />
              <Stack.Screen name="(tabs)/order-details" />
              <Stack.Screen name="(tabs)/edit-profile" />
              {/* <Stack.Screen name="(tabs)/content-section" /> */}
              <Stack.Screen name="(tabs)/messages" />
            </Stack>
          </ProtectedRoute>
        </SocketProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}