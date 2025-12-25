import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import api from '../../api/axiosInstance'; // Assuming this is your axios instance
import Assets from '../../assets';
import AlertModal from './components/AlertModal';
import Header from './components/MainHeader';
import OrderFilterTabs from './components/OrderFilterTabs';

const JobDetails: React.FC = () => {
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('Job Details');
  const [selectedFilter, setSelectedFilter] = useState('Recent');
  const [jobData, setJobData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [proposals, setProposals] = useState<any[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [proposalsError, setProposalsError] = useState<string | null>(null);

  const filterOptions = ['Recent', 'Shortlisted', 'Maybe', 'No Interest'];

  // Constants to map indices to names (same as JobPostForm)
  const stateOptions = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
    "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
    "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
    "West Virginia", "Wisconsin", "Wyoming",
  ];
  const genresOptions = ['Jazz', 'Country', 'Gospel', 'Christian', 'RnB', 'Pop', 'Blues', 'Funk'];
  const languageOptions = ['English', 'French', 'Spanish', 'Hindi', 'Urdu'];
  const genderOptions = ['Male', 'Female', 'Other'];

  // Fetch job details
  const fetchJobDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/api/jobs/job/${params.id}`);
      if (response.data.success) {
        setJobData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch job details');
      }
    } catch (error: any) {
      console.error('Error fetching job details:', error);
      setError(error.response?.data?.message || 'Failed to fetch job details');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchJobDetails();
    } else {
      setError('Invalid job ID');
      setIsLoading(false);
    }
  }, [params.id, fetchJobDetails]);

  // Fetch proposals for the job
  const fetchProposals = useCallback(async () => {
    if (!params.id) return;
    
    try {
      setProposalsLoading(true);
      setProposalsError(null);
      const response = await api.get(`/api/proposals/job/${params.id}`);
      if (response.data.success) {
        // Map API response to UI format
            const mappedProposals = response.data.data.map((proposal: any) => ({
              id: proposal.id,
              name: proposal.sellerName || 'Unknown Seller',
              location: 'Location not available', // Seller location not in API response
              rating: 4.5, // Default rating (not in API)
              reviews: 0, // Default reviews (not in API)
              badge: proposal.status === 'active' ? 'Active' : proposal.status === 'submitted' ? 'Pending' : 'Other',
              description: proposal.coverLetter || 'No cover letter provided.',
              image: require('../../assets/images/profile1.png'), // Default image
              offerPrice: proposal.offerPrice,
              sellerId: proposal.sellerId?.toString() || proposal.sellerId, // Ensure sellerId is a string
              sellerEmail: proposal.sellerEmail,
              status: proposal.status,
              buyerDecision: proposal.buyerDecision || null, // Include buyer decision
              createdAt: proposal.createdAt,
            }));
        setProposals(mappedProposals);
      } else {
        setProposalsError(response.data.message || 'Failed to fetch proposals');
        setProposals([]);
      }
    } catch (error: any) {
      console.error('Error fetching proposals:', error);
      setProposalsError(error.response?.data?.message || 'Failed to fetch proposals');
      setProposals([]);
    } finally {
      setProposalsLoading(false);
    }
  }, [params.id]);

  // Fetch proposals when Proposals tab is active and jobId is available
  useEffect(() => {
    if (activeTab === 'Proposals' && params.id && jobData) {
      fetchProposals();
    }
  }, [activeTab, params.id, jobData, fetchProposals]);

  // Format date and time
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const formatTime = (time: string) =>
    new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (type: string) => {
    if (type.includes('video'))
      return <Assets.icons.play width={24} height={24} fill='#FFFFFF' />;
    if (type.includes('audio'))
      return <Assets.icons.mic width={24} height={24} fill='#FFFFFF' />;
    if (type.includes('image'))
      return <Assets.icons.image width={24} height={24} fill='#FFFFFF' />;
    if (type.includes('pdf'))
      return <Assets.icons.document width={24} height={24} fill='#FFFFFF' />;
    return '📁';
  };

  const handleBack = () => {
    router.back();
  };

  const handleEditJob = () => {
    console.log('Edit job:', params.id);
    router.push({
      pathname: '/(tabs)/NewJobPost',
      params: { id: params.id, edit: 'true' },
    });
  };

  const handlePauseJob = () => {
    console.log('Pause job:', params.id);
    setShowPauseModal(true);
  };

  const confirmPauseJob = async () => {
  try {
    const response = await api.patch(`/api/jobs/job/${params.id}/status`, { status: 'paused' });
    if (response.data.success) {
      setJobData((prev: any) => ({ ...prev, status: 'paused' }));
      setShowPauseModal(false);
    } else {
      setError(response.data.message || 'Failed to pause job');
    }
  } catch (error: any) {
    setError(error.response?.data?.message || 'Failed to pause job');
  }
};

  const handleCloseJob = () => {
    console.log('Close job:', params.id);
    setShowCloseModal(true);
  };

  const confirmCloseJob = async () => {
  try {
    const response = await api.patch(`/api/jobs/job/${params.id}/status`, { status: 'closed' });
    if (response.data.success) {
      setJobData((prev: any) => ({ ...prev, status: 'closed' }));
      setShowCloseModal(false);
    } else {
      setError(response.data.message || 'Failed to close job');
    }
  } catch (error: any) {
    setError(error.response?.data?.message || 'Failed to close job');
  }
};

  const handleResumeJob = () => {
    console.log('Resume job:', params.id);
    setShowRepostModal(true);
  };

  const confirmRepostJob = async () => {
  try {
    const response = await api.patch(`/api/jobs/job/${params.id}/status`, { status: 'active' });
    if (response.data.success) {
      setJobData((prev: any) => ({ ...prev, status: 'active' }));
      setShowRepostModal(false);
    } else {
      setError(response.data.message || 'Failed to repost job');
    }
  } catch (error: any) {
    setError(error.response?.data?.message || 'Failed to repost job');
  }
};



    // Add delete handler
    const handleDeleteJob = () => {
      console.log('Trigger delete job:', params.id);
      setShowDeleteModal(true);
    };

    const confirmDeleteJob = async () => {
      try {
        const response = await api.delete(`/api/jobs/job/${params.id}`);
        if (response.data.success) {
          setShowDeleteModal(false);
          // Navigate back to JobContent screen
          router.push('/(tabs)/jobs');
          // router.replace('/(tabs)/job-content');
        } else {
          setError(response.data.message || 'Failed to delete job');
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to delete job');
      }
    };

  const getMenuOptions = () => {
    if (!jobData) return [];
    switch (jobData.status) {
      case 'active':
        return [
          { label: 'Edit', action: handleEditJob },
          { label: 'Pause', action: handlePauseJob },
          { label: 'Close', action: handleCloseJob },
        ];
      case 'paused':
        return [
          { label: 'Edit', action: handleEditJob },
          { label: 'Active', action: handleResumeJob },
          { label: 'Close', action: handleCloseJob },
        ];
      case 'closed':
        return [
          { label: 'Edit', action: handleEditJob },
          { label: 'Active', action: handleResumeJob },
          { label: 'Delete', action: handleDeleteJob },
        ];
      default:
        return [
          { label: 'Edit', action: handleEditJob },
          { label: 'Close', action: handleCloseJob },
        ];
    }
  };

  const handleProfilePress = (id: string) => {
    router.push(`/(tabs)/profile?id=${id}`);
  };

  const handleCoverLetterPress = (id: string) => {
    router.push(`/(tabs)/cover-letter?id=${id}`);
  };

  const handleSendMessage = (sellerId: string, proposalId?: string) => {
    const params: any = { id: sellerId };
    if (proposalId) {
      params.proposalId = proposalId;
    }
    router.push({
      pathname: '/(tabs)/messages',
      params,
    });
  };

  const renderJobDetailsTab = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600">Loading...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-600">{error}</Text>
        </View>
      );
    }
    if (!jobData) return null;

    return (
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Job Status */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-gray-600 text-base font-medium">Job Status</Text>
          <View className="bg-green-100 px-4 py-2 rounded-full">
            <Text className="text-green-600 font-semibold text-sm">
              {jobData.status.charAt(0).toUpperCase() + jobData.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Date Posted */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-gray-600 text-base font-medium">Date Posted</Text>
          <Text className="text-gray-900 font-medium">{formatDate(jobData.createdAt)}</Text>
        </View>

        {/* Active Duration */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-gray-600 text-base font-medium">Active Duration</Text>
          <Text className="text-gray-900 font-medium">{jobData.duration}</Text>
        </View>

        {/* Title */}
        <View className="mb-6">
          <Text className="text-gray-600 text-base font-medium mb-3">Title</Text>
          <Text className="text-gray-900 font-semibold text-lg leading-6">
            {jobData.title}
          </Text>
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-gray-600 text-base font-medium mb-3">Description</Text>
          <Text className="text-gray-700 text-base leading-5">
            {jobData.description}
          </Text>
        </View>

        {/* Price */}
        <View className="mb-6">
          <Text className="text-gray-600 text-base font-medium mb-3">Price</Text>
          <View className="flex-row items-center">
            <Text className="text-gray-900 font-semibold text-lg">${jobData.price}</Text>
            {jobData.isNegotiable && (
              <Text className="text-gray-500 ml-2 text-base">Negotiable</Text>
            )}
          </View>
        </View>

        {/* Date & Time */}
        <View className="mb-6">
          <Text className="text-gray-600 text-base font-medium mb-3">Date & Time</Text>
          <Text className="text-gray-900 font-medium text-base">
            {formatDate(jobData.date)} at {formatTime(jobData.time)}
          </Text>
        </View>

        {/* State, City, Zip Code */}
        <View className="flex-row mb-6">
          <View className="flex-1">
            <Text className="text-gray-600 text-base font-medium mb-3">State</Text>
            <Text className="text-gray-900 font-medium">
              {stateOptions[jobData.state - 1] || 'Unknown'}
            </Text>
          </View>
          <View className="flex-1 mx-4">
            <Text className="text-gray-600 text-base font-medium mb-3">City</Text>
            <Text className="text-gray-900 font-medium">{jobData.city}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-600 text-base font-medium mb-3">Zip Code</Text>
            <Text className="text-gray-900 font-medium">{jobData.zipCode}</Text>
          </View>
        </View>

        {/* Location with Map Preview */}
        <View className="mb-6">
          <Text className="text-gray-600 text-base font-medium mb-3">Location*</Text>
          <View className="flex-row items-center bg-red-50 p-4 rounded-lg mb-3">
            <View className="bg-white p-3 rounded-full mr-4 shadow-sm">
              <View className="w-6 h-6 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">📍</Text>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-base">
                {jobData.location.name}
              </Text>
              <Text className="text-gray-600 text-sm mt-1">{jobData.location.address}</Text>
            </View>
          </View>
          <View className="h-48 w-full">
            <MapView
              style={{ width: '100%', height: '100%' }}
              region={{
                latitude: jobData.location.coordinates[1], // latitude
                longitude: jobData.location.coordinates[0], // longitude
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: jobData.location.coordinates[1],
                  longitude: jobData.location.coordinates[0],
                }}
              />
            </MapView>
          </View>
        </View>

        {/* Range */}
        <View className="mb-6">
          <Text className="text-gray-600 text-base font-medium mb-3">Range</Text>
          <Text className="text-gray-900 font-medium">
            {jobData.range ? `Within ${jobData.range} Miles` : 'Not specified'}
          </Text>
        </View>

        {/* Categories */}
        <View className="mb-6">
          <Text className="text-gray-600 text-base font-medium mb-3">Categories</Text>
          <View className="flex-row flex-wrap">
            {jobData.categories.map((category: any, index: number) => (
              <View key={index} className="bg-gray-100 rounded-full px-6 py-3 mr-3 mb-3">
                <Text className="text-gray-800 font-medium">{category.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Genres */}
        <View className="mb-6">
          <Text className="text-gray-600 text-base font-medium mb-3">Genres</Text>
          <View className="flex-row flex-wrap">
            {jobData.genres.map((genre: any, index: number) => (
              <View key={index} className="bg-gray-100 rounded-full px-6 py-3 mr-3 mb-3">
                <Text className="text-gray-800 font-medium">{genre.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Languages */}
        <View className="mb-6">
          <Text className="text-gray-600 text-base font-medium mb-3">Language</Text>
          <View className="flex-row flex-wrap">
            {jobData.languages.map((language: any, index: number) => (
              <View key={index} className="bg-gray-100 rounded-full px-6 py-3 mr-3 mb-3">
                <Text className="text-gray-800 font-medium">{language.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Gender */}
        <View className="mb-6">
          <Text className="text-gray-600 text-base font-medium mb-3">Gender</Text>
          <View className="flex-row flex-wrap">
            {jobData.gender.map((gender: any, index: number) => (
              <View key={index} className="bg-gray-100 rounded-full px-6 py-3 mr-3 mb-3">
                <Text className="text-gray-800 font-medium">{gender.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Attachments */}
        <View className="mb-8">
          <Text className="text-gray-600 text-base font-medium mb-3">Attachments</Text>
          {jobData.attachments.map((file: any, index: number) => (
            <View key={index} className="flex-row items-center p-4 bg-gray-50 rounded-lg mb-3">
              <View className="bg-gray-200 p-3 rounded-full mr-4">
                {getFileIcon(file.type)}
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-medium text-base">{file.name}</Text>
                <Text className="text-gray-500 text-sm mt-1">
                  {formatFileSize(file.size)}
                </Text>
              </View>
              <TouchableOpacity className="p-2">
                <Text className="text-gray-400 text-xl">×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // Filter proposals based on selected filter
  const getFilteredProposals = () => {
    if (!proposals || proposals.length === 0) return [];

    switch (selectedFilter) {
      case 'Recent':
        // Show all proposals (no filtering)
        return proposals;
      case 'Shortlisted':
        return proposals.filter((p: any) => p.buyerDecision === 'shortlisted');
      case 'Maybe':
        return proposals.filter((p: any) => p.buyerDecision === 'maybe');
      case 'No Interest':
        return proposals.filter((p: any) => p.buyerDecision === 'no-interest');
      default:
        return proposals;
    }
  };

  const filteredProposals = getFilteredProposals();

  const renderProposalsTab = () => {
    return (
      <View className="flex-1">
        <OrderFilterTabs
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          filters={filterOptions}
          pillStyle={true}
          underlineStyle={false}
          containerStyle="mb-6"
          activeTextColor="text-black"
          inactiveTextColor="text-gray-600"
          activeBackgroundColor="border border-red-500"
          inactiveBackgroundColor="bg-gray-100"
        />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {proposalsLoading ? (
            <View className="py-8 items-center">
              <Text className="text-gray-500 text-center">Loading proposals...</Text>
            </View>
          ) : proposalsError ? (
            <View className="py-8 items-center px-4">
              <Text className="text-red-500 text-center mb-2">{proposalsError}</Text>
              <TouchableOpacity
                onPress={fetchProposals}
                className="mt-4 bg-red-500 px-6 py-2 rounded-lg"
              >
                <Text className="text-white font-medium">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredProposals.length === 0 ? (
            <View className="py-12 items-center px-4">
              <Text className="text-gray-500 text-center text-base mb-2">
                No {selectedFilter.toLowerCase()} proposals found
              </Text>
              <Text className="text-gray-400 text-center text-sm">
                {selectedFilter === 'Recent' 
                  ? 'There are no proposals for this job yet.'
                  : `There are no ${selectedFilter.toLowerCase()} proposals for this job.`}
              </Text>
            </View>
          ) : (
            filteredProposals.map((proposal, index) => (
              <View key={proposal.id} className="mb-6">
                <View className="flex-row items-start mb-4">
                  <TouchableOpacity onPress={() => handleProfilePress(proposal.sellerId)}>
                    <Image
                      source={proposal.image}
                      className="w-12 h-12 rounded-full mr-4"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                  <View className="flex-1">
                    <TouchableOpacity onPress={() => handleProfilePress(proposal.sellerId)}>
                      <View className="flex-row items-center mb-1">
                        <Text className="text-gray-900 font-semibold text-base mr-2">
                          {proposal.name}
                        </Text>
                        <View className="flex-row items-center">
                          <Text className="text-yellow-500 mr-1">★</Text>
                          <Text className="text-gray-700 font-medium text-sm">
                            {proposal.rating} ({proposal.reviews})
                          </Text>
                        </View>
                      </View>
                      <Text className="text-gray-500 text-sm mb-2">{proposal.location}</Text>
                    </TouchableOpacity>
                    <View className="bg-blue-50 px-3 py-1 rounded-full self-start mb-3">
                      <Text className="text-blue-600 text-xs font-medium">
                        {proposal.badge}
                      </Text>
                    </View>
                    {proposal.offerPrice && (
                      <View className="mb-2">
                        <Text className="text-gray-900 font-semibold text-base">
                          ${proposal.offerPrice}
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity onPress={() => handleCoverLetterPress(proposal.id)}>
                      <Text className="text-gray-700 text-sm leading-5 mb-4">
                        {proposal.description}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  className="border border-gray-300 rounded-lg py-3 px-4 mb-4"
                  onPress={() => handleSendMessage(proposal.sellerId, proposal.id)}
                >
                  <Text className="text-gray-700 font-medium text-center text-base">
                    Send Message
                  </Text>
                </TouchableOpacity>

                {index < filteredProposals.length - 1 && (
                  <View className="border-b border-gray-100 mb-6" />
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pb-4">
        <Header
          title="Job Detail"
          showNotification={false}
          showMoreOptions={true}
          onBackPress={handleBack}
          menuOptions={getMenuOptions()}
        />
        <OrderFilterTabs
          selectedFilter={activeTab}
          onFilterChange={setActiveTab}
          filters={['Job Details', 'Proposals']}
          underlineStyle={true}
          pillStyle={false}
          containerStyle="mt-4"
          activeTextColor="text-red-500"
          inactiveTextColor="text-gray-500"
          activeBorderColor="border-red-500"
        />
      </View>
      <View className="flex-1 px-4">
        {activeTab === 'Job Details' ? renderJobDetailsTab() : renderProposalsTab()}
      </View>

      <AlertModal
        visible={showPauseModal}
        message="Are you sure you want to pause this job post?"
        icon={
          <View className="w-14 h-14 rounded-full bg-amber-50 items-center justify-center">
            <Assets.icons.warning width={24} height={24} fill="#F59E0B" />
          </View>
        }
        primaryButtonText="Pause Job"
        secondaryButtonText="Cancel"
        onPrimaryButtonPress={confirmPauseJob}
        onSecondaryButtonPress={() => setShowPauseModal(false)}
        onClose={() => setShowPauseModal(false)}
      />
      <AlertModal
        visible={showRepostModal}
        message="Are you sure you want to repost this job?"
        icon={
          <View className="w-14 h-14 rounded-full bg-amber-50 items-center justify-center">
            <Assets.icons.warning width={24} height={24} fill="#F59E0B" />
          </View>
        }
        primaryButtonText="Repost"
        secondaryButtonText="Cancel"
        onPrimaryButtonPress={confirmRepostJob}
        onSecondaryButtonPress={() => setShowRepostModal(false)}
        onClose={() => setShowRepostModal(false)}
      />
      <AlertModal
        visible={showCloseModal}
        message="Are you sure you want to close this job post?"
        icon={
          <View className="w-14 h-14 rounded-full bg-amber-50 items-center justify-center">
            <Assets.icons.warning width={24} height={24} fill="#F59E0B" />
          </View>
        }
        primaryButtonText="Close Job"
        secondaryButtonText="Cancel"
        onPrimaryButtonPress={confirmCloseJob}
        onSecondaryButtonPress={() => setShowCloseModal(false)}
        onClose={() => setShowCloseModal(false)}
      />

      <AlertModal
      visible={showDeleteModal}
      message="Are you sure you want to delete this job post?"
      icon={
        <View className="w-14 h-14 rounded-full bg-amber-50 items-center justify-center">
          <Assets.icons.warning width={24} height={24} fill="#F59E0B" />
        </View>
      }
      primaryButtonText="Delete Job"
      secondaryButtonText="Cancel"
      onPrimaryButtonPress={confirmDeleteJob}
      onSecondaryButtonPress={() => setShowDeleteModal(false)}
      onClose={() => setShowDeleteModal(false)}
    />
    </SafeAreaView>
  );
};

export default JobDetails;