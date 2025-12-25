import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Onboarding from './(auth)/Onboarding';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Redirect href="/(tabs)/home" />;
  
  return (
    <SafeAreaView className="flex-1" edges={['top', 'left', 'right', 'bottom']}>
      <Onboarding />
    </SafeAreaView>
  );
}

// import React from 'react';
// import { Redirect } from 'expo-router';
// import { useAuth } from '../context/AuthContext';

// export default function Index() {
//   const { isAuthenticated, isLoading } = useAuth();

//   if (isLoading) return null;
//   return <Redirect href={isAuthenticated ? '/(tabs)/home' : '/(auth)/Signin'} />;
// }