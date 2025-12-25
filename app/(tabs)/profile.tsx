import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ImageSourcePropType, Text, View } from 'react-native';
import Header from './components/MainHeader';
import ProfilePage from './seller-profile-page/ProfilePage';
import api from '../../api/axiosInstance';
import { WebView } from 'react-native-webview';


// Define the structure of profileData
interface ProfileData {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  city: string;
  zip_code: string;
  price_range: { min: number; max: number };
  badge: string;
  badgeColor: string;
  availability: string[];
  description: string;
  long_description: string;
  genres: string[];
  gender: string[];
  services: string[];
  languages: string[];
  image: ImageSourcePropType;
  portfolio: Array<{ url: string; title: string; location: string; type: 'video' | 'audio' }>;
  certificates: Array<{ name: string; date: string; institution: string }>;
  education: Array<{ degree: string; date: string; institution: string }>;
  stories: Array<{ url: string; type: 'video' | 'image'; created_at: string }>;
  rating: number;
  reviews: number;
  created_at: string;
  updated_at: string;
  isFavorite: boolean;

  //Dummy Data:


}

const Profile: React.FC = () => {
  const params = useLocalSearchParams();
  const { id } = params as { id?: string }; // Type the params

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProfileData();
    } else {
      setError("Profile ID not provided");
      setLoading(false);
    }
  }, [id]);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);

     try {
      const response = await api.get(`/api/sellers/${id}`); // Fixed API path
      if (response.data.success) {
        setProfileData(response.data.data);
        console.log(response.data);
      } else {
        setError(response.data.message || 'Failed to fetch profile data');
      }
    } catch (err: any) {
      console.error('Fetch profile error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = () => {
    console.log('Notification icon pressed');
    router.push('/(tabs)/notifications');
  };

  if (error) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-4">
        <Text className="text-lg text-gray-700 text-center font-bold">
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Header
        title="Profile"
        onNotificationPress={handleNotificationPress}
      />

      <ProfilePage
        profileData={profileData}
        loading={loading}
      />
    </View>
  );
};

export default Profile;	