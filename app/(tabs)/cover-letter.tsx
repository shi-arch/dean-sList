import Assets from '@/assets';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api/axiosInstance';
import Header from './components/MainHeader';

// Constants for mapping (should match backend constants)
const genresOptions = ['Jazz', 'Country', 'Gospel', 'Christian', 'RnB', 'Pop', 'Blues', 'Funk'];
const languageOptions = ['English', 'French', 'Spanish', 'Hindi', 'Urdu'];

// Badge mapping (matching backend constants)
const BADGE_LABELS: { [key: number]: string } = {
  1: 'New',
  2: 'Rising Talent',
  3: 'Top Rated',
  4: 'Top Rated Plus',
};

const BADGE_COLORS: { [key: number]: string } = {
  1: 'bg-gray-500',
  2: 'bg-blue-500',
  3: 'bg-green-500',
  4: 'bg-purple-500',
};

const CoverLetter: React.FC = () => {
  const params = useLocalSearchParams();
  const proposalId = params.id;
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [proposalData, setProposalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Updated dummy data for the cover letter with all details from images
  // const coverLetterData = {
  //   name: 'Julian King',
  //   location: 'San Francisco, CA',
  //   rating: 4.5,
  //   reviews: 24,
  //   badge: 'Rising Talent',
  //   badgeColor: 'bg-blue-500',
  //   receivedDate: '12/02/2024',
  //   price: '$400',
  //   image: require('../../assets/images/profile1.png'),
  //   coverLetterIntro: `I hope this message finds you well. My name is Julian King, and I am a professional guitarist and singer with over 6 years of experience performing at various events, including birthday parties, weddings, and corporate gatherings. I recently came across your job posting for a live music performance at your son's upcoming birthday party, and I would love to offer my services.`,
  //   performanceDetails: [
  //     'Duration: I will perform for 2 hours, including breaks if needed.',
  //     'Music Selection: My repertoire includes a wide range of genres, from popular hits and classic rock to acoustic ballads and birthday favorites. I am also happy to accommodate any special song requests to make the event even more memorable.',
  //     'Equipment: I will bring all necessary equipment, including guitars (both acoustic and electric), amplifiers, microphones, and a portable sound system. You won\'t need to worry about any technical setup.',
  //   ],
  //   availability: 'I am available on [Event Date] and can arrive [Specify Time, e.g., an hour before the event] to set up and ensure everything runs smoothly.',
  //   services: ['Singer', 'Guitarist'],
  //   genres: ['Pop', 'Classical'],
  //   languages: ['Spanish', 'English'],
  //   attachments: [
  //     { name: 'Song.mp3', type: 'audio', size: '237kbs' },
  //     { name: 'Song.mp4', type: 'video', size: '237kbs' },
  //   ],
  // };

  // Fetch proposal data
  useEffect(() => {
    const fetchProposal = async () => {
      if (!proposalId) {
        setError('Proposal ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/api/proposals/buyer/${proposalId}`);
        
        if (response.data.success) {
          const data = response.data.data;
          setProposalData(data);
          
          // Initialize active action based on buyer decision
          if (data.buyerDecision) {
            const decisionMap: { [key: string]: string } = {
              'shortlisted': 'accept',
              'maybe': 'question',
              'no-interest': 'reject',
            };
            setActiveAction(decisionMap[data.buyerDecision] || null);
          }
        } else {
          setError(response.data.message || 'Failed to fetch proposal');
        }
      } catch (err: any) {
        console.error('Error fetching proposal:', err);
        setError(err.response?.data?.message || 'Failed to fetch proposal');
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [proposalId]);

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  // Get badge name and color
  const getBadgeInfo = (badgeId: number | undefined) => {
    if (!badgeId) return { name: 'Talent', color: 'bg-gray-500' };
    return {
      name: BADGE_LABELS[badgeId] || 'Talent',
      color: BADGE_COLORS[badgeId] || 'bg-gray-500',
    };
  };

  // Map genre IDs to names (backend may already provide names)
  const getGenreNames = (genres: any[] | undefined) => {
    if (!genres || genres.length === 0) return [];
    return genres.map(g => {
      // If backend already provided name, use it
      if (typeof g === 'object' && g.name) return g.name;
      // Otherwise map ID to name
      const id = typeof g === 'object' ? g.id : g;
      const index = id - 1; // Assuming IDs start from 1
      return index >= 0 && index < genresOptions.length ? genresOptions[index] : `Genre ${id}`;
    });
  };

  // Map language IDs to names (backend may already provide names)
  const getLanguageNames = (languages: any[] | undefined) => {
    if (!languages || languages.length === 0) return [];
    return languages.map(l => {
      // If backend already provided name, use it
      if (typeof l === 'object' && l.name) return l.name;
      // Otherwise map ID to name
      const id = typeof l === 'object' ? l.id : l;
      const index = id - 1; // Assuming IDs start from 1
      return index >= 0 && index < languageOptions.length ? languageOptions[index] : `Language ${id}`;
    });
  };

  // Get seller image
  const getSellerImage = () => {
    if (proposalData?.seller?.image) {
      return { uri: proposalData.seller.image };
    }
    return require('../../assets/images/profile1.png');
  };

  // Format attachment size
  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleBack = () => {
    router.back();
  };

  const handleSendMessage = () => {
    if (!proposalData?.seller?.id) {
      console.error('Seller ID not available');
      return;
    }
    router.push({
      pathname: '/(tabs)/messages',
      params: { 
        id: proposalData.seller.id,
        name: proposalData.seller.name || proposalData.seller.username || 'Seller',
        proposalId: proposalId // Pass proposal ID to show custom offer card
      },
    });
  };

  const updateBuyerDecision = async (decision: 'shortlisted' | 'maybe' | 'no-interest' | null) => {
    if (!proposalId) return;

    try {
      // Send decision (can be null to clear)
      const response = await api.patch(`/api/proposals/${proposalId}/decision`, { 
        decision: decision === null ? null : decision 
      });
      if (response.data.success) {
        // Update local state
        if (proposalData) {
          setProposalData({ ...proposalData, buyerDecision: decision });
        }
      }
    } catch (error: any) {
      console.error('Error updating buyer decision:', error);
      console.error('Error details:', error.response?.data);
      // You could show an error toast here
    }
  };

  const handleAccept = () => {
    const isCurrentlyActive = activeAction === 'accept';
    const newAction = isCurrentlyActive ? null : 'accept';
    setActiveAction(newAction);
    updateBuyerDecision(isCurrentlyActive ? null : 'shortlisted');
  };

  const handleQuestion = () => {
    const isCurrentlyActive = activeAction === 'question';
    const newAction = isCurrentlyActive ? null : 'question';
    setActiveAction(newAction);
    updateBuyerDecision(isCurrentlyActive ? null : 'maybe');
  };

  const handleReject = () => {
    const isCurrentlyActive = activeAction === 'reject';
    const newAction = isCurrentlyActive ? null : 'reject';
    setActiveAction(newAction);
    updateBuyerDecision(isCurrentlyActive ? null : 'no-interest');
  };

  // Determine which screen to show based on params
  const showDetailedView = params.detailed === 'true';
  const showContinuation = params.page === '2';

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-4">
          <Header 
            title="Cover Letter" 
            showNotification={true}
            onBackPress={handleBack}
          />
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-4">Loading proposal...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error || !proposalData) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-4">
          <Header 
            title="Cover Letter" 
            showNotification={true}
            onBackPress={handleBack}
          />
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-red-500 text-center mb-4">{error || 'Failed to load proposal'}</Text>
          <TouchableOpacity
            className="bg-blue-500 rounded-lg px-6 py-3"
            onPress={() => {
              setLoading(true);
              setError(null);
              // Retry fetch
              const fetchProposal = async () => {
                if (!proposalId) return;
                try {
                  const response = await api.get(`/api/proposals/buyer/${proposalId}`);
                  if (response.data.success) {
                    setProposalData(response.data.data);
                  } else {
                    setError(response.data.message || 'Failed to fetch proposal');
                  }
                } catch (err: any) {
                  setError(err.response?.data?.message || 'Failed to fetch proposal');
                } finally {
                  setLoading(false);
                }
              };
              fetchProposal();
            }}
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Extract data from proposal
  const seller = proposalData.seller || {};
  const badgeInfo = getBadgeInfo(seller.badge);
  const genreNames = getGenreNames(proposalData.genres);
  const languageNames = getLanguageNames(proposalData.languages);
  const sellerLocation = seller.city ? `${seller.city}${seller.zip_code ? `, ${seller.zip_code}` : ''}` : 'Location not available';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4">
        <Header 
          title="Cover Letter" 
          showNotification={true}
          onBackPress={handleBack}
        />
      </View>
      
      {/* Profile header on first page */}
      {!showContinuation && (
        <View className="px-4 py-3">
          <View className="flex-row items-center">
            <Image
              source={getSellerImage()}
              className="w-12 h-12 rounded-full mr-3"
            />
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="text-base font-semibold mr-2">{seller.name || seller.username || 'Unknown Seller'}</Text>
                <View className="flex-row items-center">
                  <Text className="text-yellow-500">★</Text>
                  <Text className="text-sm text-gray-500 ml-1">4.5</Text>
                  <Text className="text-sm text-gray-500 ml-1">(0)</Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-500 mr-2">{sellerLocation}</Text>
                <View className={`${badgeInfo.color} rounded-full px-2 py-0.5`}>
                  <Text className="text-white text-xs">{badgeInfo.name}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Received Date and Price */}
        <View className="flex-row justify-between mb-6">
          <View>
            <Text className="text-sm text-gray-500 mb-1">Received Date</Text>
            <Text className="text-base text-black">{formatDate(proposalData.createdAt)}</Text>
          </View>
          <View>
            <Text className="text-sm text-gray-500 mb-1">Price</Text>
            <Text className="text-base text-black font-medium">${proposalData.offerPrice || 0}</Text>
          </View>
        </View>

        {/* Cover Letter Content */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-black mb-4">Cover Letter</Text>
          <Text className="text-base text-gray-700 leading-6">
            {proposalData.coverLetter || 'No cover letter provided.'}
          </Text>
        </View>

        {/* Genres Section */}
        {genreNames.length > 0 && (
          <View className="mb-6">
            <Text className="text-base font-medium text-black mb-3">Genres</Text>
            <View className="flex-row flex-wrap">
              {genreNames.map((genre, index) => (
                <View key={index} className="bg-gray-100 rounded-full px-4 py-2 mr-3 mb-2">
                  <Text className="text-sm text-gray-700">{genre}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Language Section */}
        {languageNames.length > 0 && (
          <View className="mb-6">
            <Text className="text-base font-medium text-black mb-3">Language</Text>
            <View className="flex-row flex-wrap">
              {languageNames.map((language, index) => (
                <View key={index} className="bg-gray-100 rounded-full px-4 py-2 mr-3 mb-2">
                  <Text className="text-sm text-gray-700">{language}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Attachments Section */}
        {proposalData.attachments && proposalData.attachments.length > 0 && (
          <View className="mb-6">
            <Text className="text-base font-medium text-black mb-3">Attachments</Text>
            {proposalData.attachments.map((attachment: any, index: number) => (
              <View key={index} className="flex-row items-center bg-gray-50 rounded-lg p-3 mb-3">
                <View className="w-10 h-10 bg-gray-200 rounded-lg items-center justify-center mr-3">
                  {attachment.type === 'audio' || attachment.type === 'audio/mpeg' || attachment.type === 'audio/mp3' ? (
                    <Assets.icons.play height={24} width={24} />
                  ) : (
                    <Image
                      source={Assets.images.profile1}
                      className="w-8 h-8 rounded"
                    />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-black">{attachment.name || 'Attachment'}</Text>
                  <Text className="text-sm text-gray-500">{formatFileSize(attachment.size)}</Text>
                </View>
                <TouchableOpacity className="p-2">
                  <Assets.icons.download height={24} width={24} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

       {/* Bottom action buttons with SVGs */}
      <View className="flex-row border-t border-gray-200 p-4 bg-white">
        <TouchableOpacity
          className="bg-red-500 rounded-lg py-3 flex-1 mr-2"
          onPress={handleSendMessage}
        >
          <Text className="text-white text-center font-medium text-base">Send Message</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`rounded-lg px-3 py-3 w-11 items-center justify-center ${activeAction === 'accept' ? 'bg-green-500' : 'bg-white border border-gray-300'}`}
          onPress={handleAccept}
        >
          <Assets.icons.doublecheck
            height={24}
            width={24}
            fill={activeAction === 'accept' ? '#FFFFFF' : '#4B5563'} // White when active, gray when inactive
          />
        </TouchableOpacity>

        <TouchableOpacity
          className={`rounded-lg px-3 py-3 w-11 items-center justify-center mx-2 ${activeAction === 'question' ? 'bg-black' : 'bg-white border border-gray-300'}`}
          onPress={handleQuestion}
        >
          <Assets.icons.questionmark
            height={24}
            width={24}
            fill={activeAction === 'question' ? '#FFFFFF' : '#4B5563'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          className={`rounded-lg px-3 py-3 w-11 items-center justify-center ${activeAction === 'reject' ? 'bg-black' : 'bg-white border border-gray-300'}`}
          onPress={handleReject}
        >
          <Assets.icons.close
            height={24}
            width={24}
            fill={activeAction === 'reject' ? '#FFFFFF' : '#4B5563'}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CoverLetter;