import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import ChatScreen from './components/messages/ChatScreen';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import Assets from '../../assets';

type RecentChat = {
  id: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageDate?: Date;
  unreadCount: number;
  receiverRole: 'Buyer' | 'Seller';
  isPinned?: boolean;
  isOnline?: boolean;
};

export default function Messages() {
  const params = useLocalSearchParams<{ id?: string; name?: string; proposalId?: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [query, setQuery] = useState('');
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);

  // Fetch recent chats on mount
  const loadRecentChats = useCallback(async () => {
    try {
      setLoadingChats(true);
      
      // VALIDATION: Wait for auth to finish loading
      if (authLoading) {
        console.log('[Messages] Auth still loading, waiting...');
        setRecentChats([]);
        setLoadingChats(false);
        return;
      }

      // VALIDATION: Check if user is authenticated
      if (!isAuthenticated) {
        console.warn('[Messages] User not authenticated, skipping API call');
        setRecentChats([]);
        setLoadingChats(false);
        return;
      }

      // VALIDATION: Verify token exists before making request
      // The backend extracts userId from the token, so we don't strictly need the user object
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token || token.trim() === '') {
        console.error('[Messages] No token found in SecureStore');
        setRecentChats([]);
        setLoadingChats(false);
        return;
      }

      // Optional: Log userId if available (for debugging), but don't block if user object is null
      // The backend will extract userId from the token
      if (user?.userId) {
        console.log('[Messages] Fetching recent chats for userId:', user.userId);
      } else {
        console.log('[Messages] Fetching recent chats (userId will be extracted from token by backend)');
      }
      console.log('[Messages] Token exists:', !!token);
      const res = await api.get('/api/messages/buyer/conversations');
      console.log('[Messages] Recent chats response status:', res.status);
      console.log('[Messages] Recent chats response data:', res.data);
      
      // Handle successful response - empty array is valid (no chats yet)
      if (res.status === 200) {
        // Check if response has data array or if it's wrapped in a data property
        const chats = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.conversations || []);
        
        // Process chats to add additional fields and ensure all required fields are present
        const processedChats = (chats || [])
          .filter((chat: any) => chat && chat.receiverId && chat.receiverId !== 'unknown') // Filter out invalid chats
          .map((chat: any) => {
            // Parse lastMessageTime to Date object for proper formatting
            // Backend now returns ISO timestamp strings
            let lastMessageDate: Date | undefined;
            if (chat.lastMessageTime) {
              const parsed = new Date(chat.lastMessageTime);
              lastMessageDate = isNaN(parsed.getTime()) ? undefined : parsed;
            }
            
            return {
              ...chat,
              receiverId: chat.receiverId || 'unknown',
              receiverName: chat.receiverName || 'Unknown',
              receiverAvatar: chat.receiverAvatar || 'https://placehold.co/80x80',
              lastMessage: chat.lastMessage || 'No messages yet',
              lastMessageTime: chat.lastMessageTime || '',
              lastMessageDate: lastMessageDate,
              unreadCount: typeof chat.unreadCount === 'number' 
                ? chat.unreadCount 
                : (typeof chat.unreadCount === 'string' && chat.unreadCount === '99+' 
                  ? 99 
                  : parseInt(String(chat.unreadCount), 10) || 0),
              receiverRole: chat.receiverRole || 'Seller',
              isOnline: false, // TODO: Get actual online status from backend
              isPinned: chat.receiverName?.toLowerCase().includes('admin') || false, // Pin Admin conversations
            };
          });
        
        setRecentChats(processedChats);
        console.log('Recent chats loaded successfully:', processedChats?.length || 0, 'chats');
      } else {
        // Non-200 status, but not an exception - treat as error
        console.error('[Messages] Unexpected response status:', res.status);
        // Don't show alert for non-200 if it's not a critical error
        setRecentChats([]);
      }
    } catch (e: any) {
      console.error('[Messages] load recent chats failed', e);
      console.error('Error status:', e.response?.status);
      console.error('Error details:', e.response?.data || e.message);
      
      // Determine error type
      const status = e.response?.status;
      const isNetworkError = !e.response && (e.code === 'ECONNABORTED' || e.message === 'Network Error' || e.code === 'ERR_NETWORK');
      const isAuthError = status === 401 || status === 403;
      const isServerError = status >= 500;
      const isClientError = status >= 400 && status < 500;
      
      // Set empty array for all error cases (no chats to display)
      setRecentChats([]);
      
      // Only show alert for critical errors that user should know about
      if (isAuthError) {
        // Authentication error - user needs to login again
        // Don't show alert here, let the auth interceptor handle it
        console.warn('[Messages] Authentication error, user will be redirected to login');
      } else if (isServerError) {
        // Server error (500+) - show alert as this is a backend issue
        Alert.alert('Error', 'Unable to load recent chats. Please try again later.');
      } else if (isClientError && status !== 404) {
        // Client error (400-499, except 404) - show alert for bad requests
        // 404 is acceptable (no conversations exist)
        const errorMessage = e.response?.data?.error || 'Failed to load recent chats';
        
        // Special handling for "Invalid sender or receiver ID format" - this indicates auth/token issue
        if (errorMessage.includes('Invalid sender or receiver ID format') || errorMessage.includes('Invalid sender or receiver')) {
          console.error('[Messages] Backend returned ID format error - likely token/userId issue');
          console.error('[Messages] Current user:', user);
          console.error('[Messages] Is authenticated:', isAuthenticated);
          
          // Don't show error popup - this is an auth issue that should be handled by auth system
          // The auth interceptor will handle 401, but 400 with this message means token is invalid
          // Try to refresh token or let user know silently
          console.warn('[Messages] Token may be invalid, auth system should handle this');
          // Don't show alert - let the auth system redirect if needed
        } else {
          // For other client errors, show alert
          Alert.alert('Error', errorMessage);
        }
      } else if (isNetworkError) {
        // Network error - don't show alert, just log
        // User can retry when network is available
        console.warn('[Messages] Network error, chats will load when connection is available');
      }
      // For 404 or other non-critical errors, silently set empty array
    } finally {
      setLoadingChats(false);
      console.log('[Messages] Loading chats set to false');
    }
  }, [isAuthenticated, authLoading]); // Removed 'user' from dependencies since we don't strictly need it

  useEffect(() => {
    loadRecentChats();
  }, [loadRecentChats]);

  if (params.id) {
    return <ChatScreen receiverId={params.id} receiverName={params.name || 'Chat'} proposalId={params.proposalId} />;
  }

  const openChat = (receiverId: string, receiverName: string) => {
    router.push({ pathname: '/(tabs)/messages', params: { id: receiverId, name: receiverName } });
  };

  // Format time/date helper
  const formatMessageTime = (date: Date | string | undefined): string => {
    if (!date) return '';
    
    const messageDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    
    // Check if message is from today
    if (messageDay.getTime() === today.getTime()) {
      // Return time in 12-hour format (e.g., "2:30 PM")
      return messageDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      // Check if message is from yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (messageDay.getTime() === yesterday.getTime()) {
        return 'Yesterday';
      }
      // Return date in MM/DD format for older messages
      return messageDate.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit'
      });
    }
  };

  // Filter conversations based on search query
  const filteredChats = useMemo(() => {
    if (!query.trim()) return recentChats;
    const lowerQuery = query.toLowerCase();
    return recentChats.filter(chat => 
      chat.receiverName.toLowerCase().includes(lowerQuery) ||
      (chat.lastMessage || '').toLowerCase().includes(lowerQuery)
    );
  }, [recentChats, query]);

  // Generate color for placeholder avatar based on name (WhatsApp style)
  const getAvatarColor = (name: string): string => {
    if (!name) return '#9CA3AF'; // Default gray
    const colors = [
      '#EF4444', // red
      '#F59E0B', // amber
      '#10B981', // green
      '#3B82F6', // blue
      '#8B5CF6', // purple
      '#EC4899', // pink
      '#06B6D4', // cyan
      '#F97316', // orange
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get first letter of name for placeholder avatar
  const getInitial = (name: string): string => {
    if (!name) return '?';
    return name.trim().charAt(0).toUpperCase();
  };

  const renderConversation = ({ item }: { item: RecentChat }) => {
    const hasAvatar = item.receiverAvatar && item.receiverAvatar !== 'https://placehold.co/80x80';
    const avatarSource = hasAvatar ? { uri: item.receiverAvatar } : null;
    const initial = getInitial(item.receiverName);
    const bgColor = getAvatarColor(item.receiverName);
    
    // Use lastMessageDate if available (Date object), otherwise parse lastMessageTime (string)
    const timeToFormat = item.lastMessageDate || (item.lastMessageTime ? new Date(item.lastMessageTime) : undefined);
    const formattedTime = formatMessageTime(timeToFormat);
    
    return (
      <TouchableOpacity
        className="flex-row items-center px-4 py-4 border-b border-gray-100 active:bg-gray-50"
        onPress={() => openChat(item.receiverId, item.receiverName)}
        activeOpacity={0.7}
      >
        {/* Profile Image or Placeholder Avatar */}
        <View className="relative">
          {avatarSource ? (
            <Image 
              source={avatarSource} 
              className="w-14 h-14 rounded-full"
              defaultSource={Assets.images.profile1}
            />
          ) : (
            <View 
              className="w-14 h-14 rounded-full items-center justify-center"
              style={{ backgroundColor: bgColor }}
            >
              <Text className="text-white text-lg font-semibold">
                {initial}
              </Text>
            </View>
          )}
          {/* Online status indicator - can be added later if backend provides this */}
        </View>
        
        {/* Conversation Info */}
        <View className="flex-1 ml-3">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
              {item.receiverName}
            </Text>
            <Text className="text-xs text-gray-500 ml-2">
              {formattedTime}
            </Text>
          </View>
          
          <View className="flex-row items-center justify-between">
            <Text 
              className={`text-sm flex-1 mr-2 ${item.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`} 
              numberOfLines={1}
            >
              {item.lastMessage || 'No messages yet'}
            </Text>
            
            {/* Unread count badge */}
            {item.unreadCount > 0 && (
              <View className="bg-red-500 rounded-full min-w-[20px] h-5 px-2 items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 bg-white">
        <Text className="text-2xl font-bold text-gray-900">Messages</Text>
        <TouchableOpacity
          onPress={() => {
            // Toggle search visibility or implement search functionality
            // For now, we'll just show/hide search bar
          }}
          className="w-10 h-10 items-center justify-center"
        >
          <Assets.icons.search width={24} height={24} stroke="#374151" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3 border-b border-gray-100 bg-white">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Assets.icons.search width={18} height={18} stroke="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-base text-gray-900"
            placeholder="Search conversations"
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery('')}
              className="ml-2"
            >
              <Assets.icons.close width={18} height={18} stroke="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Conversations List */}
      <View className="flex-1">
        {loadingChats ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#EF4444" />
            <Text className="text-gray-500 mt-4">Loading conversations...</Text>
          </View>
        ) : filteredChats.length > 0 ? (
          <FlatList
            data={filteredChats}
            keyExtractor={(item, index) => item.receiverId || item.id || `chat-${index}`}
            renderItem={renderConversation}
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              query ? (
                <View className="flex-1 justify-center items-center px-4 py-12">
                  <Text className="text-gray-500 text-center">
                    No conversations found matching "{query}"
                  </Text>
                </View>
              ) : null
            }
          />
        ) : (
          <View className="flex-1 justify-center items-center px-4">
            <View className="items-center">
              <Assets.icons.messages width={64} height={64} stroke="#D1D5DB" />
              <Text className="text-gray-500 text-center mt-4 text-base">
                {query 
                  ? `No conversations found matching "${query}"`
                  : 'No conversations yet'}
              </Text>
              <Text className="text-gray-400 text-center mt-2 text-sm">
                {query 
                  ? 'Try a different search term'
                  : 'Start a conversation with a seller'}
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}