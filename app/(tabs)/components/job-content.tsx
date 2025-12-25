import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import api from '../../../api/axiosInstance';
import Assets from '../../../assets';
import AlertModal from './AlertModal';
import Header from './MainHeader';
import OrderFilterTabs from './OrderFilterTabs';

const JobContent: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('Active');
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // New pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10; // Number of jobs per page

  const filterOptions = ['Active', 'Paused', 'Closed', 'Drafts'];

  const getApiStatus = (filter: string) => {
    return filter === 'Drafts' ? 'draft' : filter.toLowerCase();
  };

  // Fetch jobs with pagination and filter
  const fetchMyJobs = useCallback(async (pageNum: number, reset: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/api/jobs/my-jobs', {
        params: {
          status: getApiStatus(activeFilter), // Use mapped status
          page: pageNum,
          limit,
        },
      });
      if (response.data.success) {
        const newJobs = response.data.data.jobs;
        setMyJobs(prev => (reset ? newJobs : [...prev, ...newJobs]));
        setHasMore(response.data.data.hasMore);
      } else {
        setError(response.data.message || 'Failed to fetch jobs');
        setHasMore(false);
      }
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      setError(error.response?.data?.message || 'Failed to fetch jobs');
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  // Fetch jobs when filter changes or component mounts
  useEffect(() => {
    setPage(1);
    setMyJobs([]); // Reset jobs when filter changes
    setHasMore(true);
    fetchMyJobs(1, true);
  }, [activeFilter, fetchMyJobs]);

  // Load more jobs
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMyJobs(nextPage);
  };

  // Update filter handler to reset pagination
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setPage(1);
    setMyJobs([]);
    setHasMore(true);
  };

  const handleNotificationPress = () => {
    console.log('Notification icon pressed');
    router.push('/(tabs)/notifications');
  };

  const handleBack = () => {
    router.back();
  };

  const handlePostNewJob = () => {
    router.push('/(tabs)/NewJobPost');
  };

  const handleViewDetails = (jobId: string) => {
    router.push({
      pathname: '/(tabs)/job-details',
      params: { id: jobId },
    });
  };

  const handleMenuToggle = (jobId: string) => {
    setMenuVisible(menuVisible === jobId ? null : jobId);
  };

  const handleEditJob = (jobId: string) => {
    setMenuVisible(null);
    router.push({
      pathname: '/(tabs)/NewJobPost',
      params: { id: jobId, edit: 'true' },
    });
  };

  const handlePauseJob = (jobId: string) => {
    setMenuVisible(null);
    setSelectedJobId(jobId);
    setShowPauseModal(true);
  };

const confirmPauseJob = async () => {
  try {
    const response = await api.patch(`/api/jobs/job/${selectedJobId}/status`, { status: 'paused' });
    if (response.data.success) {
      setMyJobs(prev =>
        prev.map(job =>
          job.id === selectedJobId ? { ...job, status: 'paused' } : job
        )
      );
      setShowPauseModal(false);
      setSelectedJobId(null);
      // Refresh the job list for the current filter
      setPage(1);
      setMyJobs([]);
      setHasMore(true);
      await fetchMyJobs(1, true);
    } else {
      setError(response.data.message || 'Failed to pause job');
    }
  } catch (error: any) {
    setError(error.response?.data?.message || 'Failed to pause job');
  }
};

  const handleCloseJob = (jobId: string) => {
    setMenuVisible(null);
    setSelectedJobId(jobId);
    setShowCloseModal(true);
  };

  const confirmCloseJob = async () => {
  try {
    const response = await api.patch(`/api/jobs/job/${selectedJobId}/status`, { status: 'closed' });
    if (response.data.success) {
      setMyJobs(prev =>
        prev.map(job =>
          job.id === selectedJobId ? { ...job, status: 'closed' } : job
        )
      );
      setShowCloseModal(false);
      setSelectedJobId(null);
      // Refresh the job list for the current filter
      setPage(1);
      setMyJobs([]);
      setHasMore(true);
      await fetchMyJobs(1, true);
    } else {
      setError(response.data.message || 'Failed to close job');
    }
  } catch (error: any) {
    setError(error.response?.data?.message || 'Failed to close job');
  }
};

  const handleResumeJob = (jobId: string) => {
    setMenuVisible(null);
    setSelectedJobId(jobId);
    setShowRepostModal(true);
  };

  const confirmRepostJob = async () => {
  try {
    const response = await api.patch(`/api/jobs/job/${selectedJobId}/status`, { status: 'active' });
    if (response.data.success) {
      setMyJobs(prev =>
        prev.map(job =>
          job.id === selectedJobId ? { ...job, status: 'active' } : job
        )
      );
      setShowRepostModal(false);
      setSelectedJobId(null);
      // Refresh the job list for the current filter
      setPage(1);
      setMyJobs([]);
      setHasMore(true);
      await fetchMyJobs(1, true);
    } else {
      setError(response.data.message || 'Failed to repost job');
    }
  } catch (error: any) {
    setError(error.response?.data?.message || 'Failed to repost job');
  }
};

  const handleDeleteDraft = async (jobId: string) => {
    try {
      const response = await api.delete(`/api/jobs/job/${jobId}`);
      if (response.data.success) {
        setMyJobs(prev => prev.filter(job => job.id !== jobId));
        setMenuVisible(null);
      } else {
        setError(response.data.message || 'Failed to delete draft');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete draft');
    }
  };

  const handlePostDraft = (jobId: string) => {
    setMenuVisible(null);
    setSelectedJobId(jobId);
    setShowPublishModal(true);
  };

  const confirmPublishJob = async () => {
  try {
    const response = await api.patch(`/api/jobs/job/${selectedJobId}/status`, { status: 'active' });
    if (response.data.success) {
      setMyJobs(prev =>
        prev.map(job =>
          job.id === selectedJobId ? { ...job, status: 'active' } : job
        )
      );
      setShowPublishModal(false);
      setSelectedJobId(null);
    } else {
      setError(response.data.message || 'Failed to publish job');
    }
  } catch (error: any) {
    setError(error.response?.data?.message || 'Failed to publish job');
  }
};

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-white border border-red-500 text-red-500';
      case 'paused':
        return 'bg-amber-400 text-white';
      case 'closed':
        return 'bg-red-500 text-white';
      case 'draft':
        return 'bg-gray-100 border border-gray-400 text-gray-800';
      default:
        return 'bg-white border border-red-500 text-red-500';
    }
  };

  const getMenuOptions = (job: any) => {
    switch (job.status) {
      case 'active':
        return (
          <>
            <TouchableOpacity
              className="py-2"
              onPress={() => handleEditJob(job.id)}
            >
              <Text className="text-gray-800">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-2"
              onPress={() => handlePauseJob(job.id)}
            >
              <Text className="text-gray-800">Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-2"
              onPress={() => handleCloseJob(job.id)}
            >
              <Text className="text-gray-800">Close</Text>
            </TouchableOpacity>
          </>
        );
      case 'paused':
        return (
          <>
            <TouchableOpacity
              className="py-2"
              onPress={() => handleEditJob(job.id)}
            >
              <Text className="text-gray-800">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-2"
              onPress={() => handleResumeJob(job.id)}
            >
              <Text className="text-gray-800">Active</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-2"
              onPress={() => handleCloseJob(job.id)}
            >
              <Text className="text-gray-800">Close</Text>
            </TouchableOpacity>
          </>
        );
      case 'closed':
        return (
          <>
            <TouchableOpacity
              className="py-2"
              onPress={() => handleEditJob(job.id)}
            >
              <Text className="text-gray-800">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-2"
              onPress={() => handleResumeJob(job.id)}
            >
              <Text className="text-gray-800">Active</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-2"
              onPress={() => handleDeleteDraft(job.id)}
            >
              <Text className="text-red-500">Delete</Text>
            </TouchableOpacity>
          </>
        );
      case 'draft':
        return (
          <>
            <TouchableOpacity
              className="py-2"
              onPress={() => handleEditJob(job.id)}
            >
              <Text className="text-gray-800">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-2"
              onPress={() => handlePostDraft(job.id)}
            >
              <Text className="text-gray-500">Post</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-2"
              onPress={() => handleDeleteDraft(job.id)}
            >
              <Text className="text-red-500">Delete</Text>
            </TouchableOpacity>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-4">
        <Header
          title="Jobs"
          showNotification={true}
          onNotificationPress={handleNotificationPress}
          onBackPress={handleBack}
        />
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Public Job Offer Section */}
        <View className="mt-4 mb-6">
          <Text className="text-[20px] font-medium mb-1">Public Job Offer</Text>
          <Text className="text-gray-500 text-base mb-3">
            Make a public job offer for all the sellers.
          </Text>
          <TouchableOpacity
            className="bg-black rounded-lg py-4"
            onPress={handlePostNewJob}
          >
            <Text className="text-white text-center font-medium">Post New Job</Text>
          </TouchableOpacity>
        </View>

        {/* My Jobs Section */}
        <View className="mb-20">
          <Text className="text-lg font-normal mb-4">My Jobs</Text>

          {/* Filter Tabs */}
          <OrderFilterTabs
            selectedFilter={activeFilter}
            onFilterChange={handleFilterChange}
            filters={filterOptions}
            underlineStyle={true}
            pillStyle={false}
            containerStyle="mb-4"
            activeTextColor="text-red-500"
            inactiveTextColor="text-black"
            activeBorderColor="bg-red-500"
          />

          {/* Job Cards */}
          {isLoading && page === 1 ? (
            <View className="py-8 items-center">
              <Text className="text-gray-500 text-center">Loading jobs...</Text>
            </View>
          ) : error ? (
            <View className="py-8 items-center">
              <Text className="text-red-500 text-center">{error}</Text>
            </View>
          ) : myJobs.length > 0 ? (
            <>
              {myJobs.map((job) => (
                <View key={job.id} className="mb-4 pb-4 border p-3 rounded-lg border-gray-200">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className={`px-3 py-1 rounded-md ${getStatusBadgeStyle(job.status)}`}>
                      <Text
                        className={`text-xs font-medium ${
                          job.status === 'active'
                            ? 'text-red-500'
                            : job.status === 'draft'
                            ? 'text-gray-500'
                            : 'text-white'
                        }`}
                      >
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleMenuToggle(job.id)}
                      className="p-2"
                    >
                      <Text className="text-xl text-gray-400">⋮</Text>
                    </TouchableOpacity>
                  </View>

                  <Text className="text-gray-800 font-medium mb-2">{job.title}</Text>

                  <TouchableOpacity onPress={() => handleViewDetails(job.id)}>
                    <Text className="text-gray-500 text-xs font-medium underline">View Details</Text>
                  </TouchableOpacity>

                  {/* Menu Options */}
                  {menuVisible === job.id && (
                    <View className="absolute right-0 top-10 bg-white shadow-lg rounded-lg py-2 px-4 z-10 border border-gray-200">
                      {getMenuOptions(job)}
                    </View>
                  )}
                </View>
              ))}
              {hasMore && (
                <TouchableOpacity
                  className="bg-gray-200 rounded-lg py-4 mt-4"
                  onPress={handleLoadMore}
                  disabled={isLoading}
                >
                  <Text className="text-center font-medium text-gray-800">
                    {isLoading ? 'Loading...' : 'Load More'}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View className="py-8 items-center">
              <Text className="text-gray-500 text-center">
                No jobs found for {activeFilter} filter
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

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
        visible={showPublishModal}
        message="Are you sure you want to make this job post live?"
        icon={
          <View className="w-14 h-14 rounded-full bg-amber-50 items-center justify-center">
            <Assets.icons.warning width={24} height={24} fill="#F59E0B" />
          </View>
        }
        primaryButtonText="Publish"
        secondaryButtonText="Cancel"
        onPrimaryButtonPress={confirmPublishJob}
        onSecondaryButtonPress={() => setShowPublishModal(false)}
        onClose={() => setShowPublishModal(false)}
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
    </View>
  );
};

export default JobContent;