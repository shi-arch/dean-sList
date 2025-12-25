import { router, Slot, usePathname } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import FooterSection from './components/FooterSection';
import { SocketProvider } from './context/SocketContext';

const HIDDEN_FOOTER_PATHS = [
  '/status',
  '/components/settings/expense-management',
  '/components/settings/update-password',
  'status',
  'new-job-post',
  'cover-letter',
] as const;

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('TabsLayout: Unauthenticated, redirecting to Signin from', pathname);
      router.replace('/(auth)/Signin');
    }
  }, [isLoading, isAuthenticated, pathname]);

  const shouldShowFooter = () => {
    return !HIDDEN_FOOTER_PATHS.some(path => pathname.includes(path));
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        {/* <ActivityIndicator size="large" color="#FF385C" /> */}
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right', 'bottom']}>
      <View className="flex-1">
        <Slot />
      </View>
      {shouldShowFooter() && <FooterSection />}
    </SafeAreaView>
  );
}