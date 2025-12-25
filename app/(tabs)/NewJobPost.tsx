import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api/axiosInstance';
import JobPostForm from './components/JobPostForm';

interface Attachment {
  name: string;
  uri: string;
  type: string;
  size: number;
}

interface LocationData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

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

const NewJobPost: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const params = useLocalSearchParams();

const [formData, setFormData] = useState<{
  id?: string; // Changed from id: string to id?: string
  title: string;
  description: string;
  duration: string;
  price: string;
  isNegotiable: boolean;
  date: Date;
  time: Date;
  state: string;
  city: string;
  zipCode: string;
  location: string;
  latitude: number;
  longitude: number;
  range: string;
  categories: string;
  genres: string;
  languages: string;
  gender: string;
  attachments: Attachment[];
}>({
  id: undefined, // Changed from '' to undefined
  title: '',
  description: '',
  duration: '1 Month',
  price: '',
  isNegotiable: false,
  date: new Date(),
  time: new Date(),
  state: '',
  city: '',
  zipCode: '',
  location: '',
  latitude: 0,
  longitude: 0,
  range: '',
  categories: '',
  genres: '',
  languages: '',
  gender: '',
  attachments: [],
});

  const [currentStep, setCurrentStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDurationOptions, setShowDurationOptions] = useState(false);
  const [showNegotiableOptions, setShowNegotiableOptions] = useState(false);
  const [showStateOptions, setShowStateOptions] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showMapScreen, setShowMapScreen] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showCancelConfirmationModal, setShowCancelConfirmationModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isLocationPermissionDenied, setIsLocationPermissionDenied] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [genresModalVisible, setGenresModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [rangeModalVisible, setRangeModalVisible] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [deletedAttachments, setDeletedAttachments] = useState<string[]>([]);

  // Add a clear function for when editing starts
  const resetEditingState = useCallback(() => {
    setDeletedAttachments([]);
    setErrorMessage('');
  }, []);

  const fetchJobData = useCallback(async () => {
    if (params.id && params.edit === 'true') {
      try {
        resetEditingState(); // Clear any previous state
        setErrorMessage('');
        const response = await api.get(`/api/jobs/job/${params.id}`);
        if (response.data.success) {
          const job = response.data.data;

          // Map job data to formData
          setFormData({
            id: job.id,
            title: job.title,
            description: job.description,
            duration: job.duration,
            price: job.price.toString(),
            isNegotiable: job.isNegotiable,
            date: new Date(job.date),
            time: new Date(job.time),
            state: stateOptions[job.state - 1] || '', // Map index to state name
            city: job.city,
            zipCode: job.zipCode,
            location: job.location.name,
            latitude: job.location.coordinates[1],
            longitude: job.location.coordinates[0],
            range: job.range ? job.range.toString() : '',
            categories: job.categories.map((cat: any) => cat.subcategory_id).join(','),
            genres: job.genres.map((g: any) => g.id).join(','),
            languages: job.languages.map((l: any) => l.id).join(','),
            gender: job.gender.map((g: any) => g.id).join(','),
            attachments: job.attachments.map((att: any) => ({
              name: att.name,
              uri: att.url,
              type: att.type,
              size: att.size,
            })),
          });

          // Set selection arrays
          setSelectedCategories(job.categories.map((cat: any) => cat.name));
          setSelectedGenres(job.genres.map((g: any) => genresOptions[g.id - 1] || '').filter(Boolean));
          setSelectedLanguages(job.languages.map((l: any) => languageOptions[l.id - 1] || '').filter(Boolean));
          setSelectedGenders(job.gender.map((g: any) => genderOptions[g.id - 1] || '').filter(Boolean));
          setSelectedRange(job.range ? `within ${job.range} miles` : null);
          setSelectedLocation({
            name: job.location.name,
            address: job.location.address,
            latitude: job.location.coordinates[1],
            longitude: job.location.coordinates[0],
          });
          setMapRegion({
            latitude: job.location.coordinates[1],
            longitude: job.location.coordinates[0],
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });

           console.log('Job data loaded successfully:', {
            attachments: job.attachments.length,
            categories: job.categories.length,
            jobId: job.id
          });
        } else {
          setErrorMessage(response.data.message || 'Failed to fetch job details');
        }
      } catch (error: any) {
        console.error('Error fetching job for edit:', error);
        setErrorMessage(error.response?.data?.message || 'Failed to fetch job details');
      }
    } else {
      // Reset state for new job creation
      resetEditingState();
    }

  }, [params.id, params.edit, resetEditingState]);

  useEffect(() => {
    fetchJobData();
  }, [fetchJobData]);

  return (
    <JobPostForm
        formData={formData}
        setFormData={setFormData}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        showTimePicker={showTimePicker}
        setShowTimePicker={setShowTimePicker}
        showDurationOptions={showDurationOptions}
        setShowDurationOptions={setShowDurationOptions}
        showNegotiableOptions={showNegotiableOptions}
        setShowNegotiableOptions={setShowNegotiableOptions}
        showStateOptions={showStateOptions}
        setShowStateOptions={setShowStateOptions}
        showLocationModal={showLocationModal}
        setShowLocationModal={setShowLocationModal}
        showMapScreen={showMapScreen}
        setShowMapScreen={setShowMapScreen}
        showConfirmationModal={showConfirmationModal}
        setShowConfirmationModal={setShowConfirmationModal}
        showCancelConfirmationModal={showCancelConfirmationModal}
        setShowCancelConfirmationModal={setShowCancelConfirmationModal}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        isLocationLoading={isLocationLoading}
        setIsLocationLoading={setIsLocationLoading}
        isLocationPermissionDenied={isLocationPermissionDenied}
        setIsLocationPermissionDenied={setIsLocationPermissionDenied}
        categoryModalVisible={categoryModalVisible}
        setCategoryModalVisible={setCategoryModalVisible}
        genresModalVisible={genresModalVisible}
        setGenresModalVisible={setGenresModalVisible}
        languageModalVisible={languageModalVisible}
        setLanguageModalVisible={setLanguageModalVisible}
        rangeModalVisible={rangeModalVisible}
        setRangeModalVisible={setRangeModalVisible}
        genderModalVisible={genderModalVisible}
        setGenderModalVisible={setGenderModalVisible}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        selectedGenres={selectedGenres}
        setSelectedGenres={setSelectedGenres}
        selectedLanguages={selectedLanguages}
        setSelectedLanguages={setSelectedLanguages}
        selectedRange={selectedRange}
        setSelectedRange={setSelectedRange}
        selectedGenders={selectedGenders}
        setSelectedGenders={setSelectedGenders}
        mapRegion={mapRegion}
        setMapRegion={setMapRegion}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        showSuccessModal={showSuccessModal}
        setShowSuccessModal={setShowSuccessModal}
        deletedAttachments={deletedAttachments}
        setDeletedAttachments={setDeletedAttachments}
        scrollViewRef={scrollViewRef}
      />
  );
};

export default NewJobPost;