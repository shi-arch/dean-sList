import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from '../../../context/AuthContext';
import Constants from 'expo-constants';

const SocketContext = createContext<Socket | null | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const apiUrl = (Constants.expoConfig?.extra as any)?.APP_API_URL || 'http://192.168.29.179:5000';

  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      const s = io(apiUrl, { query: { userId: user.userId } });
      setSocket(s);
      return () => { s.close(); };
    }
  }, [isAuthenticated, user?.userId, apiUrl]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (ctx === undefined) throw new Error('useSocket must be used within SocketProvider');
  return ctx; // may be null until connected; callers should handle null
};