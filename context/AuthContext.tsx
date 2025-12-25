import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axiosInstance';

interface User {
  userId?: string;
  _id?: string | { toString(): string };
  username: string;
  email: string;
  role?: 'Buyer' | 'Seller';
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  rememberMe: boolean;
  user: User | null;
  setIsAuthenticated: (value: boolean) => void;
  setRememberMe: (value: boolean) => void;
  logout: () => Promise<void>;
  checkToken: () => Promise<boolean>;
  debugToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Helper function to decode base64 (fallback if atob is not available)
  const base64Decode = (str: string): string => {
    if (typeof atob !== 'undefined') {
      return atob(str);
    }
    // Fallback for environments without atob (shouldn't be needed in modern React Native/Expo)
    try {
      // Simple base64 decode using Buffer (available in React Native via polyfills)
      if (typeof Buffer !== 'undefined') {
        return Buffer.from(str, 'base64').toString('utf-8');
      }
      // Last resort: manual base64 decode (simplified)
      throw new Error('No base64 decoder available');
    } catch (error) {
      throw new Error('Unable to decode base64');
    }
  };

  // Helper function to decode JWT and check expiration
  const isTokenExpired = (token: string): boolean => {
    try {
      // JWT format: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      
      // Decode payload (base64url)
      const payload = parts[1];
      // Replace URL-safe base64 characters
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      // Add padding if needed
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
      const decoded = JSON.parse(base64Decode(padded));
      
      // Check expiration (exp is in seconds, Date.now() is in milliseconds)
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        console.log('checkToken: Token is expired');
        return true;
      }
      return false;
    } catch (error) {
      console.warn('checkToken: Error decoding token, assuming expired:', error);
      return true;
    }
  };

  const checkToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const storedRememberMe = await SecureStore.getItemAsync('rememberMe');
      console.log('checkToken: Token found:', !!token, 'RememberMe:', storedRememberMe);
      
      // If no token exists, user is not authenticated
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setRememberMe(false);
        return false;
      }

      // Check if token is expired locally before making network call
      if (isTokenExpired(token)) {
        console.log('checkToken: Token expired locally, clearing');
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('rememberMe');
        setIsAuthenticated(false);
        setUser(null);
        setRememberMe(false);
        return false;
      }

      // If token exists and is not expired, validate it with backend
      console.log('checkToken: Validating token with backend');
      try {
        const response = await api.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000, // 10 second timeout for validation
        });
        console.log('checkToken: Backend response status:', response.status);
        console.log('checkToken: Backend response data:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 200) {
          // The profile endpoint returns { user: {...} }, so extract the user object
          let userData = response.data.user || response.data;
          
          // If userData is still the full response object, try to extract it
          if (userData && typeof userData === 'object' && !userData.username && !userData.email && userData.user) {
            userData = userData.user;
          }
          
          // Ensure userData has userId (might be _id from backend)
          if (userData) {
            if (!userData.userId && userData._id) {
              userData.userId = typeof userData._id === 'string' ? userData._id : userData._id.toString();
            }
            // If still no userId, try to extract from token
            if (!userData.userId) {
              try {
                // Decode JWT payload to get userId
                const parts = token.split('.');
                if (parts.length === 3) {
                  const payload = parts[1];
                  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
                  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
                  const decoded = JSON.parse(base64Decode(padded));
                  if (decoded && decoded.userId) {
                    userData.userId = typeof decoded.userId === 'string' ? decoded.userId : decoded.userId.toString();
                    console.log('checkToken: Extracted userId from token:', userData.userId);
                  }
                }
              } catch (e) {
                console.warn('checkToken: Could not decode token for userId:', e);
              }
            }
          }
          
          console.log('checkToken: Processed userData:', userData);
          console.log('checkToken: userData.userId:', userData?.userId);
          
          if (userData && userData.userId) {
            setUser(userData); // Store user data from profile response
            setIsAuthenticated(true);
            setRememberMe(storedRememberMe === 'true');
            return true;
          } else {
            console.error('checkToken: User data is invalid or missing userId:', userData);
            // Still authenticate if we have a valid token, but log the issue
            setIsAuthenticated(true);
            setRememberMe(storedRememberMe === 'true');
            return true;
          }
        }
        
        // Non-200 status, treat as invalid
        console.log('checkToken: Invalid token response, clearing');
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('rememberMe');
        setIsAuthenticated(false);
        setUser(null);
        setRememberMe(false);
        return false;
      } catch (validationError: any) {
        // Check if it's a network error (no response) vs authentication error
        const isNetworkError = !validationError.response && (validationError.code === 'ECONNABORTED' || validationError.message === 'Network Error' || validationError.code === 'ERR_NETWORK');
        const isAuthError = validationError.response?.status === 401 || validationError.response?.status === 403;
        
        if (isAuthError) {
          // Authentication error - token is invalid, clear it
          console.log('checkToken: Authentication error (401/403), clearing token');
          await SecureStore.deleteItemAsync('accessToken');
          await SecureStore.deleteItemAsync('rememberMe');
          setIsAuthenticated(false);
          setUser(null);
          setRememberMe(false);
          return false;
        } else if (isNetworkError) {
          // Network error - token is not expired, so authenticate optimistically
          // This allows the user to stay logged in when network is temporarily unavailable
          // The token will be validated on the next successful API call
          console.warn('checkToken: Network error during validation, but token is not expired. Authenticating optimistically.');
          setIsAuthenticated(true);
          setRememberMe(storedRememberMe === 'true');
          // Don't clear token on network errors - user can retry when network is available
          // Note: We don't have user data, but that's okay - it will be fetched on next API call
          return true;
        } else {
          // Other errors (500, etc.) - log but authenticate optimistically if token is valid
          console.warn('checkToken: Validation error (non-auth):', validationError.message || validationError);
          // If token is not expired, authenticate optimistically
          setIsAuthenticated(true);
          setRememberMe(storedRememberMe === 'true');
          // Keep token in case it's a temporary server issue
          return true;
        }
      }
    } catch (error: any) {
      // Unexpected error - log and don't authenticate
      console.error('checkToken: Unexpected error:', error);
      setIsAuthenticated(false);
      return false;
    }
  };

  const debugToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const storedRememberMe = await SecureStore.getItemAsync('rememberMe');
      console.log('debugToken: Stored token:', token ? `${token.substring(0, 10)}...` : 'No token');
      console.log('debugToken: RememberMe:', storedRememberMe);
      const isValid = await checkToken();
      console.log('debugToken: Token valid:', isValid);
    } catch (error) {
      console.error('debugToken: Error:', error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('initializeAuth: Starting');
      setIsLoading(true);
      await checkToken();
      setIsLoading(false);
      console.log('initializeAuth: Complete, isAuthenticated:', isAuthenticated, 'rememberMe:', rememberMe);
    };
    initializeAuth();
  }, []);

const logout = async () => {
    try {
      console.log('logout: Initiating logout');
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        console.log('logout: Calling /logout API');
        await api.post('/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      console.log('logout: Clearing token and rememberMe');
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('rememberMe');
      setIsAuthenticated(false);
      setUser(null);
      setRememberMe(false);
      router.replace('/(auth)/Signin');
      console.log('logout: Complete');
    } catch (error) {
      console.error('logout: Error:', error);
      // Proceed with client-side cleanup even if API call fails
      console.log("api call failed");
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('rememberMe');
      setIsAuthenticated(false);
      setUser(null);
      setRememberMe(false);
      router.replace('/(auth)/Signin');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, rememberMe,user, setIsAuthenticated, setRememberMe, logout, checkToken, debugToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};