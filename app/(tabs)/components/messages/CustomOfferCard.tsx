import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import api from '../../../../api/axiosInstance';
import Assets from '../../../../assets';

// Constants for mapping (should match backend constants)
const genresOptions = ['Jazz', 'Country', 'Gospel', 'Christian', 'RnB', 'Pop', 'Blues', 'Funk'];
const languageOptions = ['English', 'French', 'Spanish', 'Hindi', 'Urdu'];

type CustomOfferCardProps = {
  proposalId: string;
  price: number | string;
  description: string;
  coverLetter?: string;
  services?: any[]; // Categories - can be IDs or objects with name
  genres?: any[]; // Can be IDs or objects with name
  languages?: any[]; // Can be IDs or objects with name
  location?: {
    name?: string;
    address?: string;
    coordinates?: {
      coordinates: number[];
    };
  };
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  eventDetails?: {
    date?: string | Date;
    time?: string | Date;
    address?: string;
  };
  status?: 'submitted' | 'active' | 'rejected' | 'archived';
  onStatusChange?: () => void;
  onStatusUpdate?: (newStatus: 'active' | 'rejected') => void;
  isLoadingMap?: boolean; // New prop to indicate if map is loading
};

const CustomOfferCard: React.FC<CustomOfferCardProps> = ({
  proposalId,
  price,
  description,
  coverLetter,
  services = [],
  genres = [],
  languages = [],
  location,
  attachments = [],
  eventDetails,
  status = 'submitted',
  onStatusChange,
  onStatusUpdate,
  isLoadingMap = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Map genre IDs to names
  const getGenreNames = (genres: any[]) => {
    if (!genres || genres.length === 0) return [];
    return genres.map(g => {
      if (typeof g === 'object' && g.name) return g.name;
      const id = typeof g === 'object' ? g.id : g;
      const index = id - 1;
      return index >= 0 && index < genresOptions.length ? genresOptions[index] : `Genre ${id}`;
    });
  };

  // Map language IDs to names
  const getLanguageNames = (languages: any[]) => {
    if (!languages || languages.length === 0) return [];
    return languages.map(l => {
      if (typeof l === 'object' && l.name) return l.name;
      const id = typeof l === 'object' ? l.id : l;
      const index = id - 1;
      return index >= 0 && index < languageOptions.length ? languageOptions[index] : `Language ${id}`;
    });
  };

  // Get service names (categories)
  const getServiceNames = (services: any[]) => {
    if (!services || services.length === 0) return [];
    return services.map(s => {
      if (typeof s === 'string') return s;
      if (typeof s === 'object' && s.name) return s.name;
      return `Service ${s}`;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}kbs`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}mb`;
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'TBD';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const formatTime = (time: string | Date | undefined) => {
    if (!time) return 'TBD';
    const t = typeof time === 'string' ? new Date(time) : time;
    return t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handleAccept = async () => {
    if (processing || status !== 'submitted') return;

    Alert.alert(
      'Accept Offer',
      'Are you sure you want to accept this custom offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          style: 'default',
          onPress: async () => {
            try {
              setProcessing(true);
              const response = await api.patch(`/api/proposals/${proposalId}/status`, {
                status: 'active',
              });

              if (response.data.success) {
                Alert.alert('Success', 'Custom offer accepted! An order has been created.');
                // Update status immediately
                onStatusUpdate?.('active');
                // Reload messages to get updated data
                onStatusChange?.();
              } else {
                Alert.alert('Error', response.data.message || 'Failed to accept offer');
              }
            } catch (error: any) {
              console.error('Error accepting offer:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to accept offer');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    if (processing || status !== 'submitted') return;

    Alert.alert(
      'Reject Offer',
      'Are you sure you want to reject this custom offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              const response = await api.patch(`/api/proposals/${proposalId}/status`, {
                status: 'rejected',
              });

              if (response.data.success) {
                Alert.alert('Success', 'Custom offer rejected.');
                // Update status immediately
                onStatusUpdate?.('rejected');
                // Reload messages to get updated data
                onStatusChange?.();
    } else {
                Alert.alert('Error', response.data.message || 'Failed to reject offer');
              }
            } catch (error: any) {
              console.error('Error rejecting offer:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to reject offer');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const genreNames = getGenreNames(genres);
  const languageNames = getLanguageNames(languages);
  const serviceNames = getServiceNames(services);

  // Parse cover letter for details
  const coverLetterText = coverLetter || description || '';
  const lines = coverLetterText.split('\n').filter(line => line.trim());
  const firstDetail = lines.find(line => line.includes('Performance Duration') || line.includes('Duration'));
  const hasMoreDetails = lines.length > 1 || coverLetterText.length > 150;

  return (
    <View className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-gray-200">
        <Text className="text-gray-900 text-sm font-semibold">Custom Offer</Text>
        <Text className="text-gray-900 text-lg font-bold">${price}</Text>
      </View>
      
      {/* Description */}
      <Text className="text-gray-800 text-sm mb-3">{description || coverLetterText.split('\n')[0]}</Text>

      {/* Details with Read More */}
      {hasMoreDetails && (
        <View className="mb-3">
          {expanded ? (
            <View>
              {lines.map((line, index) => (
                <Text key={index} className="text-gray-800 text-sm mb-1">
                  • {line}
                </Text>
              ))}
            </View>
          ) : (
            firstDetail && (
              <Text className="text-gray-800 text-sm mb-1">
                • {firstDetail.length > 50 ? `${firstDetail.substring(0, 50)}...` : firstDetail}
            </Text>
            )
          )}
          <TouchableOpacity onPress={() => setExpanded(!expanded)} className="self-end mt-1">
            <Text className="text-gray-600 text-sm">{expanded ? 'Read Less' : 'Read More'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Services */}
      {serviceNames.length > 0 && (
        <View className="mb-3">
          <Text className="text-gray-600 text-sm mb-2">Services</Text>
          <View className="flex-row flex-wrap">
            {serviceNames.map((service, index) => (
              <View key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
                <Text className="text-gray-800 text-xs">{service}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Genres */}
      {genreNames.length > 0 && (
        <View className="mb-3">
          <Text className="text-gray-600 text-sm mb-2">Genres</Text>
          <View className="flex-row flex-wrap">
            {genreNames.map((genre, index) => (
              <View key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
                <Text className="text-gray-800 text-xs">{genre}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Language */}
      {languageNames.length > 0 && (
        <View className="mb-3">
          <Text className="text-gray-600 text-sm mb-2">Language</Text>
          <View className="flex-row flex-wrap">
            {languageNames.map((language, index) => (
              <View key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
                <Text className="text-gray-800 text-xs">{language}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Location */}
      {location && (
        <View className="mb-3">
          <Text className="text-gray-600 text-sm mb-2">Location*</Text>
          <View className="flex-row items-start mb-2">
            <View className="w-8 h-8 rounded-full border-2 border-rose-500 items-center justify-center mr-2">
              <Text className="text-rose-500 text-xs">📍</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-sm font-medium">{location.name || 'Location'}</Text>
              <Text className="text-gray-600 text-xs">{location.address || ''}</Text>
            </View>
          </View>
          {/* Map View with skeleton loader */}
          {isLoadingMap ? (
            <View className="h-32 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-200">
              <View className="h-full w-full bg-gray-300 items-center justify-center">
                <Text className="text-gray-500 text-xs">Loading map...</Text>
              </View>
            </View>
          ) : location.coordinates && location.coordinates.coordinates && location.coordinates.coordinates.length >= 2 ? (
            <View className="h-32 w-full rounded-lg overflow-hidden border border-gray-200">
              <MapView
                style={{ width: '100%', height: '100%' }}
                region={{
                  latitude: location.coordinates.coordinates[1], // latitude
                  longitude: location.coordinates.coordinates[0], // longitude
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: location.coordinates.coordinates[1],
                    longitude: location.coordinates.coordinates[0],
                  }}
                />
              </MapView>
            </View>
          ) : (
            <View className="bg-gray-100 rounded-lg h-32 items-center justify-center border border-gray-200">
              <Text className="text-gray-500 text-xs">Map View</Text>
            </View>
          )}
        </View>
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <View className="mb-3">
          <Text className="text-gray-600 text-sm mb-2">Attachments</Text>
          {attachments.map((attachment, index) => (
            <View key={index} className="flex-row items-center bg-gray-50 rounded-lg p-3 mb-2 border border-gray-200">
              <View className="w-10 h-10 bg-gray-200 rounded-lg items-center justify-center mr-3">
                {attachment.type?.includes('audio') || attachment.type?.includes('mp3') ? (
                  <Assets.icons.play width={20} height={20} fill="#4B5563" />
                ) : attachment.type?.includes('video') || attachment.type?.includes('mp4') ? (
                  <Image
                    source={Assets.images.profile1}
                    className="w-8 h-8 rounded"
                  />
                ) : (
                  <Text className="text-gray-600 text-xs">📄</Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-sm font-medium">{attachment.name}</Text>
                <Text className="text-gray-500 text-xs">{formatFileSize(attachment.size)}</Text>
              </View>
              <TouchableOpacity className="p-2">
                <Assets.icons.download width={20} height={20} stroke="#4B5563" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      {/* Event Details Card - Always show if we have any event details or if status allows actions */}
      {(eventDetails || status === 'submitted') && (
        <View className="bg-gray-100 rounded-lg p-4 mt-3">
          {eventDetails?.address && (
            <View className="flex-row items-start mb-2">
              <Text className="text-gray-600 text-base mr-2">📍</Text>
              <View className="flex-1">
                <Text className="text-gray-800 text-sm">{eventDetails.address}</Text>
              </View>
            </View>
          )}
          {eventDetails?.date && (
            <View className="flex-row items-center mb-2">
              <Assets.icons.calendar width={16} height={16} stroke="#666" />
              <Text className="text-gray-800 text-sm ml-2">{formatDate(eventDetails.date)}</Text>
            </View>
          )}
          {eventDetails?.time && (
            <View className="flex-row items-center mb-2">
              <Text className="text-gray-600 text-base mr-2">🕐</Text>
              <Text className="text-gray-800 text-sm">{formatTime(eventDetails.time)}</Text>
            </View>
          )}

          {/* Status or Action Buttons */}
          {status === 'rejected' ? (
            <View className="flex-row items-center mt-2 pt-2 border-t border-gray-300">
              <View className="w-5 h-5 rounded-full bg-red-500 items-center justify-center mr-2">
                <Text className="text-white text-xs font-bold">i</Text>
              </View>
              <Text className="text-red-600 font-medium">Rejected</Text>
            </View>
          ) : status === 'active' ? (
            <View className="flex-row items-center mt-2 pt-2 border-t border-gray-300">
              <View className="w-5 h-5 rounded-full bg-green-500 items-center justify-center mr-2">
                <Text className="text-white text-xs font-bold">✓</Text>
              </View>
              <Text className="text-green-600 font-medium">Accepted</Text>
            </View>
          ) : (
            <View className="flex-row mt-3 pt-3 border-t border-gray-300">
              <TouchableOpacity
                className="flex-1 bg-white rounded-lg py-3 mr-2 items-center"
                onPress={handleReject}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text className="text-black font-medium">Reject</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-pink-500 rounded-lg py-3 items-center"
                onPress={handleAccept}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-medium">Accept</Text>
                )}
      </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default CustomOfferCard;
