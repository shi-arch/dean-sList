import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import api from '../../../../api/axiosInstance';
import { useAuth } from '../../../../context/AuthContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import CustomOfferCard from './CustomOfferCard';
import CustomOfferCardSkeleton from './CustomOfferCardSkeleton';
import Assets from '../../../../assets';
import { useSocket } from '../../context/SocketContext';
import { useSendMessage } from '../../hooks/useSendMessage';

type Message = {
  _id?: string;
  localId?: string;
  senderId: string | { _id: string };
  receiverId: string | { _id: string };
  senderRole?: 'Buyer' | 'Seller';
  receiverRole?: 'Buyer' | 'Seller';
  text?: string;  // Changed from 'message' to match backend schema
  file?: { url: string; type: 'image' | 'video' | 'document' };
  createdAt: string;
  status?: 'pending' | 'sent' | 'failed';
  type?: string;
  proposalId?: string;
  proposalStatus?: string;
  offerDetails?: any;
};

const ChatScreen: React.FC<{ receiverId: string; receiverName?: string; proposalId?: string }> = ({ receiverId, receiverName = 'Chat', proposalId }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const { sendMessage } = useSendMessage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellerData, setSellerData] = useState<any>(null);
  const [proposalDataMap, setProposalDataMap] = useState<Record<string, any>>({});
  const [loadingProposals, setLoadingProposals] = useState<Set<string>>(new Set());
  const listRef = useRef<FlatList>(null);
  const fetchedProposalsRef = useRef<Set<string>>(new Set());

  const myId = useMemo(() => {
    const id = user?.userId;
    console.log('[ChatScreen] myId from user:', { userId: user?.userId, fullUser: user });
    return id;
  }, [user]);

  // Callback to update proposal status in the map after accept/reject
  const updateProposalStatus = useCallback(async (proposalId: string, newStatus: 'active' | 'rejected') => {
    // Update the map immediately for instant UI feedback
    setProposalDataMap(prev => {
      if (prev[proposalId]) {
        return {
          ...prev,
          [proposalId]: {
            ...prev[proposalId],
            status: newStatus,
          },
        };
      }
      return prev;
    });
    
    // Also update messages to reflect the new status
    setMessages(prev => prev.map(msg => {
      if (msg.proposalId === proposalId) {
        return {
          ...msg,
          proposalStatus: newStatus,
        };
      }
      return msg;
    }));
    
    // Refetch proposal data to ensure we have the latest information
    try {
      const res = await api.get(`/api/proposals/buyer/${proposalId}`);
      if (res.data.success) {
        setProposalDataMap(prev => ({
          ...prev,
          [proposalId]: res.data.data,
        }));
      }
    } catch (e) {
      console.error('[ChatScreen] Failed to refetch proposal after status update:', e);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/messages/${receiverId}`);
      const loadedMessages = (res.data || []).map((m: any) => {
        // Handle populated senderId/receiverId objects
        const senderIdValue = typeof m.senderId === 'object' && m.senderId?._id 
          ? m.senderId._id.toString() 
          : (m.senderId?.toString() || m.senderId);
        const receiverIdValue = typeof m.receiverId === 'object' && m.receiverId?._id 
          ? m.receiverId._id.toString() 
          : (m.receiverId?.toString() || m.receiverId);
        
        // Log custom offer messages to debug
        if (m.type === 'custom_offer') {
          console.log('[ChatScreen] Loading custom offer message:', {
            id: m._id,
            type: m.type,
            proposalId: m.proposalId,
            hasOfferDetails: !!m.offerDetails,
            offerDetails: m.offerDetails,
            senderId: senderIdValue,
            receiverId: receiverIdValue,
          });
        }
        
        return { 
        ...m, 
          senderId: senderIdValue,
          receiverId: receiverIdValue,
          senderRole: m.senderRole,  // Include senderRole from backend (don't default - use actual value)
          receiverRole: m.receiverRole,  // Include receiverRole from backend (don't default - use actual value)
        text: m.text,  // Map backend 'text' to frontend 'text'
          type: m.type || 'text',  // Ensure type is included
          proposalId: m.proposalId?.toString() || m.proposalId,  // Ensure proposalId is included as string
          offerDetails: m.offerDetails,  // Include offerDetails if present
          proposalStatus: m.proposalStatus || m.status,  // Include proposal status if available
        status: 'sent' 
        };
      });
      // Reverse messages so newest is first in array (will be shown at bottom with inverted)
      // With inverted={true}, array[0] appears at bottom
      const reversedMessages = [...loadedMessages].reverse();
      setMessages(reversedMessages);
      
      // Scroll to bottom (offset 0 in inverted list) after messages are set
      // Use a small delay to ensure layout is complete, but no animation
      setTimeout(() => {
        if (listRef.current && reversedMessages.length > 0) {
          // For inverted FlatList, offset 0 means bottom (newest message)
          listRef.current.scrollToOffset({ offset: 0, animated: false });
        }
      }, 100);
    } catch (e) {
      console.error('[ChatScreen] load messages failed', e);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [receiverId, user]);

  // Fetch seller data for header
  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const res = await api.get(`/api/sellers/${receiverId}`);
        if (res.data.success) {
          setSellerData(res.data.data);
        }
      } catch (e) {
        console.error('[ChatScreen] Failed to fetch seller data:', e);
      }
    };
    fetchSellerData();
  }, [receiverId]);

  // Fetch proposal data for all custom offer messages that don't have offerDetails
  useEffect(() => {
    const fetchProposalData = async () => {
      if (!messages.length) return;
      
      // Find all custom offer messages that need proposal data
      const proposalsToFetch = messages
        .filter((m: any) => 
          m.type === 'custom_offer' && 
          m.proposalId && 
          !m.offerDetails && 
          !proposalDataMap[m.proposalId] &&
          !fetchedProposalsRef.current.has(m.proposalId)
        )
        .map((m: any) => m.proposalId);
      
      if (proposalsToFetch.length === 0) return;
      
      // Mark as fetched to prevent duplicate requests
      proposalsToFetch.forEach(id => fetchedProposalsRef.current.add(id));
      
      // Mark proposals as loading
      setLoadingProposals(prev => new Set([...prev, ...proposalsToFetch]));
      
      // Fetch all proposals in parallel
      const fetchPromises = proposalsToFetch.map(async (proposalId: string) => {
        try {
          console.log('[ChatScreen] Fetching proposal data for:', proposalId);
        const res = await api.get(`/api/proposals/buyer/${proposalId}`);
        if (res.data.success) {
            console.log('[ChatScreen] Proposal data fetched successfully:', proposalId);
            return { proposalId, data: res.data.data };
          }
        } catch (e) {
          console.error('[ChatScreen] Failed to fetch proposal:', proposalId, e);
          // Remove from fetched set on error so it can be retried
          fetchedProposalsRef.current.delete(proposalId);
        }
        return null;
      });
      
      const results = await Promise.all(fetchPromises);
      
      // Update proposal data map
      setProposalDataMap(prev => {
        const newMap = { ...prev };
        results.forEach(result => {
          if (result) {
            newMap[result.proposalId] = result.data;
          }
        });
        return newMap;
      });
      
      // Remove from loading set
      setLoadingProposals(prev => {
        const newSet = new Set(prev);
        proposalsToFetch.forEach(id => newSet.delete(id));
        return newSet;
      });
    };
    
    fetchProposalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);
  
  // Fetch proposal data if proposalId is provided in params (for direct navigation from cover letter)
  useEffect(() => {
    const fetchProposalData = async () => {
      if (user?.role !== 'Buyer' || !proposalId) return;
      
      // Only fetch if proposalId is provided in params and we don't already have the data
      if (proposalId && !proposalDataMap[proposalId] && !fetchedProposalsRef.current.has(proposalId)) {
        try {
          fetchedProposalsRef.current.add(proposalId);
          setLoadingProposals(prev => new Set([...prev, proposalId]));
          console.log('[ChatScreen] Fetching proposal data from params:', proposalId);
          const res = await api.get(`/api/proposals/buyer/${proposalId}`);
          if (res.data.success) {
            console.log('[ChatScreen] Proposal data fetched from params successfully');
            setProposalDataMap(prev => ({ ...prev, [proposalId]: res.data.data }));
        }
      } catch (e) {
          console.error('[ChatScreen] Failed to fetch proposal data from params:', e);
          fetchedProposalsRef.current.delete(proposalId);
        } finally {
          setLoadingProposals(prev => {
            const newSet = new Set(prev);
            newSet.delete(proposalId);
            return newSet;
          });
        }
      }
    };
    fetchProposalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalId, user]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!socket) return;
    const handler = (payload: any) => {
      // Check if message is for this conversation
      // In buyer app, receiverId is the seller's ID we're chatting with
      const isForThisConversation = payload.receiverId === receiverId || payload.senderId === receiverId;
      
      if (isForThisConversation) {
        // Add new message at the beginning (will appear at bottom with inverted)
        setMessages(prev => [
          {
            _id: payload._id,
            senderId: payload.senderId,
            receiverId: payload.receiverId,
            senderRole: payload.senderRole,  // Include senderRole from socket payload (use actual value)
            receiverRole: payload.receiverRole,  // Include receiverRole from socket payload (use actual value)
            text: payload.message,  // Map socket 'message' to 'text' for consistency
            file: payload.file,
            createdAt: payload.createdAt || new Date().toISOString(),
            status: 'sent',
          },
          ...prev,
        ]);
        // Scroll to bottom (offset 0) with animation for new messages
        setTimeout(() => {
          listRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 10);
      }
    };
    socket.on('newMessage', handler);
    return () => { socket.off('newMessage', handler); };
  }, [socket, receiverId]);

  const doSend = useCallback(async (content: string, file?: any, retryLocalId?: string) => {
    const now = new Date().toISOString();
    const localId = retryLocalId || Math.random().toString(36).slice(2);

    if (!retryLocalId) {
      // Add new message at the beginning (will appear at bottom with inverted)
      setMessages(prev => [
        {
          localId,
          senderId: myId || '',
          receiverId,
          text: content,  // Use 'text' for consistency
          file,
          createdAt: now,
          status: 'pending',
        },
        ...prev,
      ]);
      // Scroll to bottom (offset 0) with animation for sent messages
      setTimeout(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 10);
    } else {
      setMessages(prev => prev.map(m => (m.localId === retryLocalId ? { ...m, status: 'pending' } : m)));
    }

    try {
      const res = await sendMessage(receiverId, content, file);
      setMessages(prev =>
        prev.map(m =>
          m.localId === localId
            ? {
                ...m,
                _id: res?._id || m._id,
                status: 'sent',
                createdAt: res.createdAt || now,
              }
            : m
        )
      );
    } catch (e) {
      console.error('[ChatScreen] send failed', e);
      setMessages(prev => prev.map(m => (m.localId === localId ? { ...m, status: 'failed' } : m)));
    }
  }, [myId, receiverId, sendMessage]);

  const handleRetry = useCallback((localId: string) => {
    const msg = messages.find(m => m.localId === localId);
    if (!msg) return;
    doSend(msg.text || '', msg.file, localId);  // Use 'text'
  }, [messages, doSend]);

  const sellerName = sellerData?.name || sellerData?.first_name || receiverName;
  const sellerLocation = sellerData?.location || sellerData?.city 
    ? `${sellerData.city || ''}${sellerData.zip_code ? `, ${sellerData.zip_code}` : ''}`.trim() 
    : 'Location not available';
  const sellerImage = sellerData?.image 
    ? { uri: sellerData.image } 
    : require('../../../../assets/images/profile1.png');

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right', 'bottom']}>
      {/* Header with seller info */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Assets.icons.back width={22} height={22} stroke="#000" />
        </TouchableOpacity>
        <View className="flex-row items-center flex-1 mx-3">
          <View className="w-10 h-10 rounded-full border-2 border-red-500 mr-3 overflow-hidden">
            <Image 
              source={sellerImage} 
              className="w-full h-full" 
              resizeMode="cover"
            />
          </View>
          <View className="flex-1">
            <Text className="text-black font-semibold text-base">{sellerName}</Text>
            <Text className="text-gray-500 text-xs">{sellerLocation}</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-3">
            <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
              <Text className="text-gray-600 text-lg">＋</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text className="text-2xl text-gray-400">⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={listRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
        data={messages}
        inverted={true}  // Inverted: newest messages at bottom, scroll up to see older
        keyExtractor={(item, idx) => item._id || item.localId || String(idx)}
        renderItem={({ item, index }) => {
          const senderId = typeof item.senderId === 'string' ? item.senderId : item.senderId?._id?.toString() || item.senderId?._id;
          // In buyer app: buyer messages should be on right (isSender = true), seller messages on left (isSender = false)
          // Use senderRole to determine alignment - if senderRole === 'Buyer', it's the buyer's message (right side)
          // Fallback to ID comparison if senderRole is not available
          let isSender = false;
          if (item.senderRole === 'Buyer') {
            // Buyer's message - show on right (like WhatsApp - sent messages on right)
            isSender = true;
          } else if (item.senderRole === 'Seller') {
            // Seller's message - show on left (like WhatsApp - received messages on left)
            isSender = false;
          } else {
            // Fallback: compare IDs if senderRole is not available
            // In buyer app, if senderId matches myId, it's the buyer's message (right side)
            const normalizedSenderId = senderId?.toString();
            const normalizedMyId = myId?.toString();
            isSender = normalizedSenderId && normalizedMyId && normalizedSenderId === normalizedMyId;
          }
          
          const isCustomOffer = Boolean(item.type === 'custom_offer' && item.proposalId);
          
          // For custom offer messages, show the card instead of regular message
          // Show custom offer card for buyers (regardless of sender, but typically from sellers)
          // Also show if user role is not yet loaded (assume buyer if in buyer app)
          if (isCustomOffer && (user?.role === 'Buyer' || !user)) {
            console.log('[ChatScreen] Rendering custom offer card', { userRole: user?.role, hasUser: !!user });
            // Use offerDetails from message if available
            const offerDetails = item.offerDetails;
            
            // Check if proposal data is still loading
            const isLoadingProposal = item.proposalId ? loadingProposals.has(item.proposalId) : false;
            const currentProposalData = item.proposalId ? proposalDataMap[item.proposalId] : null;
            
            // Show full skeleton if:
            // 1. We have a proposalId but no data yet (offerDetails or currentProposalData)
            // 2. OR we're currently loading the proposal
            // This ensures skeleton shows immediately when message is first rendered
            const hasProposalId = Boolean(item.proposalId);
            const hasNoData = !offerDetails && !currentProposalData;
            if (hasProposalId && hasNoData) {
              return <CustomOfferCardSkeleton />;
            }
            
            // Determine location and map loading state
            // Card should display immediately with available data, only map shows skeleton
            let locationData = null;
            let isMapLoading = false;
            
            if (offerDetails) {
              // We have offerDetails - use them immediately
              locationData = offerDetails.eventDetails?.location || offerDetails.location;
              // Map is loading if location exists but coordinates are missing or invalid
              isMapLoading = locationData && (!locationData.coordinates || !locationData.coordinates.coordinates || locationData.coordinates.coordinates.length < 2);
            } else if (currentProposalData) {
              // We have proposal data - use it immediately
              locationData = currentProposalData.jobId?.location;
              // Map is loading if location exists but coordinates are missing or invalid
              // Also check if we're still loading and coordinates might come later
              const hasValidCoordinates = locationData?.coordinates?.coordinates && locationData.coordinates.coordinates.length >= 2;
              isMapLoading = locationData && !hasValidCoordinates;
            } else {
              // No proposal data yet, but we're showing the card with fallback
              // Map will show skeleton since we don't have location data
              isMapLoading = true;
            }
            
            // If we have offerDetails in the message, use them directly
            if (offerDetails) {
              console.log('[ChatScreen] Using offerDetails from message:', offerDetails);
              // Get proposal data for status if available
              const proposalDataForStatus = item.proposalId ? proposalDataMap[item.proposalId] : null;
              return (
                <View>
                  <CustomOfferCard
                    proposalId={item.proposalId || ''}
                    price={offerDetails.price || 0}
                    description={offerDetails.description || item.text || 'Custom offer'}
                    coverLetter={offerDetails.description || item.text}
                    services={offerDetails.categories || []}
                    genres={offerDetails.genres || []}
                    languages={offerDetails.languages || []}
                    location={locationData}
                    attachments={offerDetails.attachments || []}
                    eventDetails={{
                      date: offerDetails.eventDetails?.date,
                      time: offerDetails.eventDetails?.time,
                      address: offerDetails.eventDetails?.location?.address || offerDetails.location?.address,
                    }}
                    status={item.proposalStatus || proposalDataForStatus?.status || 'submitted'}
                    isLoadingMap={isMapLoading}
                    onStatusChange={() => {
                      // Update status in map and reload messages
                      if (item.proposalId) {
                        // The status will be updated by the CustomOfferCard after API call
                        loadMessages();
                      }
                    }}
                    onStatusUpdate={(newStatus) => {
                      // Update proposal status in map immediately
                      if (item.proposalId) {
                        updateProposalStatus(item.proposalId, newStatus);
                      }
                    }}
                  />
                </View>
              );
            }
            
            // If no offerDetails, use proposalData from map if available
            // Show card immediately with available data
            return (
              <View>
                {currentProposalData ? (
                  <CustomOfferCard
                    proposalId={item.proposalId || currentProposalData.id}
                    price={currentProposalData.offerPrice || 0}
                    description={currentProposalData.coverLetter?.split('\n')[0] || item.text || 'I\'ll sing and perform at your son\'s Birthday event.'}
                    coverLetter={currentProposalData.coverLetter}
                    services={currentProposalData.categories || []}
                    genres={currentProposalData.genres || []}
                    languages={currentProposalData.languages || []}
                    location={locationData}
                    attachments={currentProposalData.attachments || []}
                    eventDetails={{
                      date: currentProposalData.jobId?.date,
                      time: currentProposalData.jobId?.time,
                      address: currentProposalData.jobId?.location?.address,
                    }}
                    status={item.proposalStatus || currentProposalData.status || 'submitted'}
                    isLoadingMap={isMapLoading}
                    onStatusChange={() => {
                      // Update status in map and reload messages
                      if (item.proposalId) {
                        loadMessages();
                      }
                    }}
                    onStatusUpdate={(newStatus) => {
                      // Update proposal status in map immediately
                      if (item.proposalId) {
                        updateProposalStatus(item.proposalId, newStatus);
                      }
                    }}
                  />
                ) : (
                  // Show card with message text as fallback (will update when proposal data loads)
                  <CustomOfferCard
                    proposalId={item.proposalId || ''}
                    price={0}
                    description={item.text || 'Custom offer'}
                    coverLetter={item.text}
                    services={[]}
                    genres={[]}
                    languages={[]}
                    attachments={[]}
                    status="submitted"
                    isLoadingMap={isLoadingProposal}
                    onStatusChange={() => {
                      if (item.proposalId) {
                        loadMessages();
                      }
                    }}
                    onStatusUpdate={(newStatus) => {
                      if (item.proposalId) {
                        updateProposalStatus(item.proposalId, newStatus);
                      }
                    }}
                  />
                )}
              </View>
            );
          }
          
          return (
            <View>
              <ChatMessage
                message={item}
                isSender={isSender}
                status={item.status}
                onRetry={item.status === 'failed' ? () => handleRetry(item.localId!) : undefined}
                senderAvatar={isSender ? undefined : sellerImage}
                receiverAvatar={isSender ? require('../../../../assets/images/profile1.png') : undefined}
              />
            </View>
          );
        }}
        onContentSizeChange={() => {
          // Only auto-scroll when new messages arrive and user is at bottom
          // Don't scroll on initial load to avoid animation
          if (messages.length > 0 && !loading) {
            // Check if user is near the bottom before auto-scrolling
            // For now, always scroll for new messages (can be enhanced later)
          }
        }}
        ListHeaderComponent={loading ? <Text className="text-gray-500 text-center py-4">Loading…</Text> : null}
      />

      <ChatInput receiverId={receiverId} onSend={(content, file) => doSend(content, file)} />
    </SafeAreaView>
  );
};

export default ChatScreen;