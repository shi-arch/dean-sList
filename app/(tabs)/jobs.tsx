import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import JobContent from './components/job-content';

const Jobs: React.FC = () => {
  const params = useLocalSearchParams();
  const showNewJobPost = params.new === 'true';

  return (
    <View className="flex-1 bg-white">
      <JobContent />
    </View>
  );
};

export default Jobs;

