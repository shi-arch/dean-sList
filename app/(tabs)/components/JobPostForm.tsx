import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  AppState,
  AppStateStatus,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import api from "../../../api/axiosInstance";
import Assets from "../../../assets";
import "../../global.css";
import AlertModal from "./AlertModal";
import Header from "./MainHeader";
import ActionButtons from "./buttons/action-button";
import LocationLoader from "./loader/location-loader";

// Interface definitions for type safety
interface Attachment {
  name: string;
  uri: string;
  type: string;
  size: number;
  url?: string; // For existing attachments with HTTP URLs
}

interface LocationData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface JobPostFormProps {
  formData: {
    id?: string;
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
  };
  setFormData: React.Dispatch<React.SetStateAction<JobPostFormProps["formData"]>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  showDatePicker: boolean;
  setShowDatePicker: React.Dispatch<React.SetStateAction<boolean>>;
  showTimePicker: boolean;
  setShowTimePicker: React.Dispatch<React.SetStateAction<boolean>>;
  showDurationOptions: boolean;
  setShowDurationOptions: React.Dispatch<React.SetStateAction<boolean>>;
  showNegotiableOptions: boolean;
  setShowNegotiableOptions: React.Dispatch<React.SetStateAction<boolean>>;
  showStateOptions: boolean;
  setShowStateOptions: React.Dispatch<React.SetStateAction<boolean>>;
  showLocationModal: boolean;
  setShowLocationModal: React.Dispatch<React.SetStateAction<boolean>>;
  showMapScreen: boolean;
  setShowMapScreen: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirmationModal: boolean;
  setShowConfirmationModal: React.Dispatch<React.SetStateAction<boolean>>;
  showCancelConfirmationModal: boolean;
  setShowCancelConfirmationModal: React.Dispatch<React.SetStateAction<boolean>>;
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  isLocationLoading: boolean;
  setIsLocationLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isLocationPermissionDenied: boolean;
  setIsLocationPermissionDenied: React.Dispatch<React.SetStateAction<boolean>>;
  categoryModalVisible: boolean;
  setCategoryModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  genresModalVisible: boolean;
  setGenresModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  languageModalVisible: boolean;
  setLanguageModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  rangeModalVisible: boolean;
  setRangeModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  genderModalVisible: boolean;
  setGenderModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  selectedGenres: string[];
  setSelectedGenres: React.Dispatch<React.SetStateAction<string[]>>;
  selectedLanguages: string[];
  setSelectedLanguages: React.Dispatch<React.SetStateAction<string[]>>;
  selectedRange: string | null;
  setSelectedRange: React.Dispatch<React.SetStateAction<string | null>>;
  selectedGenders: string[];
  setSelectedGenders: React.Dispatch<React.SetStateAction<string[]>>;
  deletedAttachments: string[];
  setDeletedAttachments: React.Dispatch<React.SetStateAction<string[]>>;
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  setMapRegion: React.Dispatch<
    React.SetStateAction<{
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    }>
  >;
  selectedLocation: LocationData | null;
  setSelectedLocation: React.Dispatch<React.SetStateAction<LocationData | null>>;
  showSuccessModal: boolean;
  setShowSuccessModal: React.Dispatch<React.SetStateAction<boolean>>;
  scrollViewRef: React.RefObject<ScrollView | null>;
}

const JobPostForm: React.FC<JobPostFormProps> = ({
  formData,
  setFormData,
  currentStep,
  setCurrentStep,
  showDatePicker,
  setShowDatePicker,
  showTimePicker,
  setShowTimePicker,
  showDurationOptions,
  setShowDurationOptions,
  showNegotiableOptions,
  setShowNegotiableOptions,
  showStateOptions,
  setShowStateOptions,
  showLocationModal,
  setShowLocationModal,
  showMapScreen,
  setShowMapScreen,
  showConfirmationModal,
  setShowConfirmationModal,
  showCancelConfirmationModal,
  setShowCancelConfirmationModal,
  errorMessage,
  setErrorMessage,
  isLocationLoading,
  setIsLocationLoading,
  isLocationPermissionDenied,
  setIsLocationPermissionDenied,
  categoryModalVisible,
  setCategoryModalVisible,
  genresModalVisible,
  setGenresModalVisible,
  languageModalVisible,
  setLanguageModalVisible,
  rangeModalVisible,
  setRangeModalVisible,
  genderModalVisible,
  setGenderModalVisible,
  selectedCategories,
  setSelectedCategories,
  selectedGenres,
  setSelectedGenres,
  selectedLanguages,
  setSelectedLanguages,
  selectedRange,
  setSelectedRange,
  selectedGenders,
  setSelectedGenders,
  deletedAttachments,
  setDeletedAttachments,
  mapRegion,
  setMapRegion,
  selectedLocation,
  setSelectedLocation,
  showSuccessModal,
  setShowSuccessModal,
  scrollViewRef,
}) => {
  const insets = useSafeAreaInsets();
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  
  // Static options arrays
  const durationOptions = [
    "1 Week",
    "2 Weeks",
    "1 Month",
    "3 Months",
    "6 Months",
    "1 Year",
  ];
  const negotiableOptions = ["Negotiable", "Fixed"];
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

  const rangeOptions = [
    "within 50 miles",
    "within 100 miles",
    "within 150 miles",
    "within 250 miles",
    "within 500 miles",
    "within 1000 miles",
  ];

  const genresOptions = ['Jazz', 'Country', 'Gospel', 'Christian', 'RnB', 'Pop', 'Blues', 'Funk'];
  const languageOptions = ['English', 'French', 'Spanish', 'Hindi', 'Urdu'];
  const genderOptions = ['Male', 'Female', 'Other'];

  // Dynamic category data from API
  const [categoryData, setCategoryData] = useState<
    { section: string; items: { name: string; subcategory_id: number }[] }[]
  >([]);

  // Load job data when editing an existing job
  useEffect(() => {
    if (formData.id) {
      const fetchJobData = async () => {
        try {
          const response = await api.get(`/api/jobs/job/${formData.id}`);
          if (response.data.success) {
            const job = response.data.data;
            setFormData({
              id: job.id,
              title: job.title,
              description: job.description,
              duration: job.duration,
              price: job.price.toString(),
              isNegotiable: job.isNegotiable,
              date: new Date(job.date),
              time: new Date(job.time),
              state: stateOptions[job.state - 1] || '',
              city: job.city,
              zipCode: job.zipCode,
              location: job.location.name,
              latitude: job.location.coordinates[1],
              longitude: job.location.coordinates[0],
              range: job.range ? `within ${job.range} miles` : '',
              categories: job.categories.map((c: any) => c.subcategory_id).join(','),
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
            setSelectedLocation({
              name: job.location.name,
              address: job.location.address,
              latitude: job.location.coordinates[1],
              longitude: job.location.coordinates[0],
            });
            setSelectedCategories(job.categories.map((c: any) => c.name));
            setSelectedGenres(job.genres.map((g: any) => g.name));
            setSelectedLanguages(job.languages.map((l: any) => l.name));
            setSelectedGenders(job.gender.map((g: any) => g.name));
            setSelectedRange(job.range ? `within ${job.range} miles` : null);
          } else {
            setErrorMessage('Failed to load job data');
          }
        } catch (error) {
          console.error('Error fetching job data:', error);
          setErrorMessage('Failed to load job data');
        }
      };
      fetchJobData();
    }
  }, [formData.id, setFormData, setSelectedLocation, setSelectedCategories, setSelectedGenres, setSelectedLanguages, setSelectedGenders, setSelectedRange, setErrorMessage]);

  // Fetch categories from API on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/api/sellers/categories/categories");
        if (response.data.success) {
          const formattedData = response.data.data.map((category: any) => ({
            section: category.name,
            items: category.subcategories.map((sub: any) => ({
              name: sub.name,
              subcategory_id: sub.subcategory_id,
            })),
          }));
          setCategoryData(formattedData);
        } else {
          setCategoryData([]);
          setErrorMessage("Failed to load categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategoryData([]);
        setErrorMessage("Failed to load categories");
      }
    };
    fetchCategories();
  }, [setErrorMessage]);

  // Initialize user's location on component mount
  const initializeLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        // Don't set error message, just mark permission as denied
        setIsLocationPermissionDenied(true);
        return;
      }

      // Permission granted, clear the denied flag
      setIsLocationPermissionDenied(false);

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setMapRegion({
        latitude: Number(location.coords.latitude) || 37.78825,
        longitude: Number(location.coords.longitude) || -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      // console.error("Error initializing location:", error);
      // Only set error if it's not a permission issue
      if (error instanceof Error && !error.message.includes("permission") && !error.message.includes("device setting")) {
        setErrorMessage("Failed to initialize location");
      } else {
        setIsLocationPermissionDenied(true);
      }
    }
  }, [setMapRegion, setIsLocationPermissionDenied, setErrorMessage]);

  // Open device location settings and attempt to re-initialize location
  const openLocationSettings = useCallback(async () => {
    try {
      // First, try to request permission again (in case user hasn't permanently denied)
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === "granted") {
        // Permission granted! Clear the denied flag and re-initialize location
        setIsLocationPermissionDenied(false);
        await initializeLocation();
        return;
      }

      // If permission is still denied, open device settings
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }

      // The AppState listener will handle re-checking permission when user returns from settings
    } catch (error) {
      console.error("Error handling location permission:", error);
      // If requesting permission fails, try to open settings as fallback
      try {
        if (Platform.OS === 'ios') {
          await Linking.openURL('app-settings:');
        } else {
          await Linking.openSettings();
        }
      } catch (settingsError) {
        Alert.alert("Error", "Unable to open settings. Please enable location manually in your device settings.");
      }
    }
  }, [initializeLocation, setIsLocationPermissionDenied]);

  useEffect(() => {
    initializeLocation();
  }, [initializeLocation]);

  // Re-check location permission when app comes to foreground
  useEffect(() => {
    const checkLocationPermission = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === "granted") {
          setIsLocationPermissionDenied(false);
          // Re-initialize location if permission was granted
          await initializeLocation();
        }
      } catch (error) {
        console.error("Error checking location permission:", error);
      }
    };

    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && isLocationPermissionDenied) {
        checkLocationPermission();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isLocationPermissionDenied, initializeLocation]);

  // Date and time formatting functions
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatTime = (time: Date) =>
    time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  // Date picker handlers
  const onDateChange = useCallback(
    (event: any, selectedDate?: Date) => {
      setShowDatePicker(false);
      if (selectedDate) {
        setFormData((prev) => ({ ...prev, date: selectedDate }));
      }
    },
    [setFormData, setShowDatePicker]
  );

  const onTimeChange = useCallback(
    (event: any, selectedTime?: Date) => {
      setShowTimePicker(false);
      if (selectedTime) {
        setFormData((prev) => ({ ...prev, time: selectedTime }));
      }
    },
    [setFormData, setShowTimePicker]
  );

  // Get user's current location
  const handleAddCurrentLocation = useCallback(async () => {
    try {
      setIsLocationLoading(true);
      setMapError(null);
      
      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        Alert.alert(
          "Location Services Disabled",
          "Please enable location services in your device settings to use this feature.",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Open Settings", 
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }
            }
          ]
        );
        setIsLocationLoading(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setIsLocationPermissionDenied(true);
        setIsLocationLoading(false);
        return;
      }

      // Clear permission denied flag if permission is granted
      setIsLocationPermissionDenied(false);

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const latitude = Number(location.coords.latitude) || 0;
      const longitude = Number(location.coords.longitude) || 0;

      if (!latitude || !longitude) {
        throw new Error("Invalid location coordinates");
      }

      // Update map region with current location
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      let addressResponse: Location.LocationGeocodedAddress[] = [];
      try {
        addressResponse = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
      } catch (geocodeError) {
        console.warn("Reverse geocoding failed, using default address:", geocodeError);
      }

      let locationName = "Current Location";
      let locationAddress = "Unknown Address";

      if (addressResponse?.length > 0) {
        const address = addressResponse[0];
        locationName = address.name || address.city || "Current Location";
        locationAddress = [address.city, address.region, address.country]
          .filter(Boolean)
          .join(", ");
      }

      const newLocation: LocationData = {
        name: locationName,
        address: locationAddress,
        latitude,
        longitude,
      };

      setSelectedLocation(newLocation);
      setFormData((prev) => ({
        ...prev,
        location: JSON.stringify(newLocation),
        latitude,
        longitude,
      }));
      setShowLocationModal(false);
    } catch (error: any) {
      console.error("Error getting current location:", error);
      const errorMessage = error?.message || "Failed to get current location";
      Alert.alert("Location Error", errorMessage);
      setMapError(errorMessage);
    } finally {
      setIsLocationLoading(false);
    }
  }, [setFormData, setSelectedLocation, setShowLocationModal, setIsLocationLoading]);

  // Handle map location selection
  const handleMapLocationSelect = useCallback(async () => {
    try {
      setMapError(null);
      const latitude = Number(mapRegion.latitude) || 37.78825;
      const longitude = Number(mapRegion.longitude) || -122.4324;
      console.log('handleMapLocationSelect coords:', { latitude, longitude });

      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        throw new Error("Invalid map coordinates");
      }

      let addressResponse: Location.LocationGeocodedAddress[] = [];
      try {
        addressResponse = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
      } catch (geocodeError) {
        console.warn("Reverse geocoding failed, using default address:", geocodeError);
      }

      let locationName = "Selected Location";
      let locationAddress = "Unknown Address";

      if (addressResponse?.length > 0) {
        const address = addressResponse[0];
        locationName = address.formattedAddress || address.name || address.street || address.city || "Selected Location";
        locationAddress = [
          address.streetNumber,
          address.street,
          address.city,
          address.region,
          address.country,
        ].filter(Boolean).join(", ") || "Unknown Address";
      }

      const newLocation: LocationData = {
        name: locationName,
        address: locationAddress,
        latitude,
        longitude,
      };
      console.log('newLocation:', JSON.stringify(newLocation, null, 2));

      setSelectedLocation(newLocation);
      setFormData((prev) => ({
        ...prev,
        location: JSON.stringify(newLocation),
        latitude,
        longitude,
      }));
      setShowMapScreen(false);
    } catch (error: any) {
      console.error("Error selecting map location:", error);
      const errorMessage = error?.message || "Failed to process selected location. Please try again.";
      Alert.alert("Location Error", errorMessage);
      setMapError(errorMessage);
    }
  }, [mapRegion, setFormData, setSelectedLocation, setShowMapScreen]);

  // Document picker for file attachments
  const pickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: Platform.OS === "ios"
          ? ["public.audio", "public.video", "public.pdf", "public.image"]
          : ["audio/*", "video/*", "application/pdf", "image/*"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);

      if (fileInfo.exists && "size" in fileInfo) {
        setFormData((prev) => ({
          ...prev,
          attachments: [
            ...prev.attachments,
            {
              name: asset.name,
              uri: Platform.OS === "ios" ? asset.uri.replace("file://", "") : asset.uri,
              type: asset.mimeType || "application/octet-stream",
              size: fileInfo.size,
            },
          ],
        }));
      } else {
        Alert.alert("Error", "Failed to get file information");
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to upload file. Please try again.");
    }
  }, [setFormData]);

  // Remove attachment from list
  const removeAttachment = useCallback(
    (index: number) => {
      setFormData((prev) => {
        const attachment = prev.attachments[index];
        if (attachment.uri.startsWith("http") || attachment.uri.startsWith("/Uploads/")) {
          const urlToDelete = attachment.uri.startsWith("/Uploads/")
            ? `http://localhost:3000${attachment.uri}`
            : attachment.uri;
          setDeletedAttachments((prevDeleted) => {
            if (!prevDeleted.includes(urlToDelete)) {
              return [...prevDeleted, urlToDelete];
            }
            return prevDeleted;
          });
        }
        return {
          ...prev,
          attachments: prev.attachments.filter((_, i) => i !== index),
        };
      });
    },
    [setFormData, setDeletedAttachments]
  );

  // Toggle category selection
  const toggleCategory = useCallback(
    (category: { name: string; subcategory_id: number }) => {
      setSelectedCategories((prev) => {
        const newCategories = prev.includes(category.name)
          ? prev.filter((c) => c !== category.name)
          : [...prev, category.name];

        setFormData((prevForm) => ({
          ...prevForm,
          categories: newCategories
            .map((name) => {
              const item = categoryData
                .flatMap((c) => c.items)
                .find((i) => i.name === name);
              return item?.subcategory_id || 0;
            })
            .filter((id) => id > 0)
            .join(","),
        }));
        return newCategories;
      });
    },
    [setSelectedCategories, setFormData, categoryData]
  );

  // Toggle genre selection
  const toggleGenre = useCallback(
    (genre: string) => {
      setSelectedGenres((prev) => {
        const newGenres = prev.includes(genre)
          ? prev.filter((g) => g !== genre)
          : [...prev, genre];

        setFormData((prevForm) => ({
          ...prevForm,
          genres: newGenres
            .map((g) => genresOptions.indexOf(g) + 1)
            .filter((id) => id > 0)
            .join(","),
        }));
        return newGenres;
      });
    },
    [setSelectedGenres, setFormData, genresOptions]
  );

  // Toggle language selection
  const toggleLanguage = useCallback(
    (lang: string) => {
      setSelectedLanguages((prev) => {
        const newLanguages = prev.includes(lang)
          ? prev.filter((l) => l !== lang)
          : [...prev, lang];

        setFormData((prevForm) => ({
          ...prevForm,
          languages: newLanguages
            .map((l) => languageOptions.indexOf(l) + 1)
            .filter((id) => id > 0)
            .join(","),
        }));
        return newLanguages;
      });
    },
    [setSelectedLanguages, setFormData, languageOptions]
  );

  // Toggle gender selection
  const toggleGender = useCallback(
    (gender: string) => {
      setSelectedGenders((prev) => {
        const newGenders = prev.includes(gender)
          ? prev.filter((g) => g !== gender)
          : [...prev, gender];

        setFormData((prevForm) => ({
          ...prevForm,
          gender: newGenders
            .map((g) => genderOptions.indexOf(g) + 1)
            .filter((id) => id > 0)
            .join(","),
        }));
        return newGenders;
      });
    },
    [setSelectedGenders, setFormData, genderOptions]
  );

  // Select range option
  const selectRange = useCallback(
    (range: string) => {
      setSelectedRange(range);
      setFormData((prev) => ({ ...prev, range }));
      setRangeModalVisible(false);
    },
    [setSelectedRange, setFormData, setRangeModalVisible]
  );

  // Form validation functions
  const validateStep1 = () => {
    const requiredFields = ["title", "description", "price", "state", "city", "zipCode", "location"];
    for (const field of requiredFields) {
      const value = formData[field as keyof typeof formData];
      if (typeof value === "string" && (!value || value.trim() === "")) {
        Alert.alert("Missing Information", `Please enter ${field}`);
        return false;
      }
    }
    // Validate numeric fields
    if (formData.price && isNaN(Number(formData.price))) {
      Alert.alert("Invalid Input", "Price must be a valid number");
      return false;
    }
    if (formData.zipCode && !/^\d{5}$/.test(formData.zipCode)) {
      Alert.alert("Invalid Input", "Zip Code must be a valid 5-digit number");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const requiredFields = ["categories", "genres", "languages", "gender"];
    for (const field of requiredFields) {
      const value = formData[field as keyof typeof formData];
      if (!value || (typeof value === "string" && value.trim() === "")) {
        Alert.alert("Missing Information", `Please select ${field}`);
        return false;
      }
    }
    return true;
  };

  // Continue to next step
  const handleContinue = useCallback(() => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [currentStep, formData, setCurrentStep, scrollViewRef]);

  // Show confirmation modal for posting/updating job
  const handlePostJob = useCallback(() => {
    if (!validateStep1() || !validateStep2()) return;
    setShowConfirmationModal(true);
  }, [setShowConfirmationModal, validateStep1, validateStep2]);

  // Confirm and post/update job to backend
  const confirmPostJob = useCallback(async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("duration", formData.duration);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("isNegotiable", formData.isNegotiable.toString());
      formDataToSend.append("date", formData.date.toISOString());
      formDataToSend.append("time", formData.time.toISOString());

      const stateIndex = stateOptions.indexOf(formData.state) + 1;
      if (stateIndex === 0) {
        setErrorMessage("Invalid state selected");
        return;
      }
      formDataToSend.append("state", stateIndex.toString());

      formDataToSend.append("city", formData.city);
      formDataToSend.append("zipCode", formData.zipCode);

      formDataToSend.append(
        "location",
        JSON.stringify({
          name: selectedLocation?.name || formData.location || "TBD",
          address: selectedLocation?.address || formData.location || "TBD",
          coordinates: [formData.longitude || 0, formData.latitude || 0],
        })
      );

      if (formData.range) {
        const rangeMatch = formData.range.match(/\d+/);
        const rangeNumber = rangeMatch ? parseInt(rangeMatch[0]) : null;
        formDataToSend.append("range", rangeNumber?.toString() || "");
      } else {
        formDataToSend.append("range", "");
      }

      // Validate and append array fields
      if (!formData.categories || formData.categories.trim() === "") {
        setErrorMessage("At least one category must be selected");
        return;
      }
      formDataToSend.append("categories", formData.categories);

      if (!formData.genres || formData.genres.trim() === "") {
        setErrorMessage("At least one genre must be selected");
        return;
      }
      formDataToSend.append("genres", formData.genres);

      if (!formData.languages || formData.languages.trim() === "") {
        setErrorMessage("At least one language must be selected");
        return;
      }
      formDataToSend.append("languages", formData.languages);

      if (!formData.gender || formData.gender.trim() === "") {
        setErrorMessage("At least one gender must be selected");
        return;
      }
      formDataToSend.append("gender", formData.gender);

      // Handle attachments
      const existingAttachments = formData.attachments
        .filter((file) => file.uri.startsWith("http") || file.uri.startsWith("/Uploads/"))
        .map((file) => ({
          name: file.name,
          url: file.uri.startsWith("/Uploads/") ? `http://localhost:3000${file.uri}` : file.uri,
          type: file.type,
          size: file.size,
        }));

      formDataToSend.append("existingAttachments", JSON.stringify(existingAttachments));

      if (deletedAttachments.length > 0) {
        formDataToSend.append("deletedAttachments", JSON.stringify(deletedAttachments));
      }

      const newFiles = formData.attachments.filter(
        (file) => !file.uri.startsWith("http") && !file.uri.startsWith("/Uploads/")
      );
      newFiles.forEach((file) => {
        formDataToSend.append("attachments", {
          uri: Platform.OS === "ios" ? file.uri.replace("file://", "") : file.uri,
          name: file.name,
          type: file.type,
        } as any);
      });

      // Enhanced logging for debugging
      console.log('FormData to send:', {
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        price: formData.price,
        isNegotiable: formData.isNegotiable,
        date: formData.date.toISOString(),
        time: formData.time.toISOString(),
        state: stateIndex,
        city: formData.city,
        zipCode: formData.zipCode,
        location: JSON.stringify({
          name: selectedLocation?.name || formData.location || "TBD",
          address: selectedLocation?.address || formData.location || "TBD",
          coordinates: [formData.longitude || 0, formData.latitude || 0],
        }),
        range: formData.range ? formData.range.match(/\d+/)?.[0] || "" : "",
        categories: formData.categories,
        genres: formData.genres,
        languages: formData.languages,
        gender: formData.gender,
        existingAttachments,
        deletedAttachments,
        newFiles,
      });

      const endpoint = formData.id ? `/api/jobs/job/${formData.id}` : "/api/jobs/post";
      const method = formData.id ? api.patch : api.post;

      const response = await method(endpoint, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setShowConfirmationModal(false);
        setShowSuccessModal(true);
        setDeletedAttachments([]);
        setTimeout(() => {
          setShowSuccessModal(false);
          router.push({
            pathname: "/(tabs)/job-details",
            params: { id: response.data.jobId || formData.id },
          });
        }, 2000);
      } else {
        setErrorMessage(
          response.data.errors?.join(", ") || response.data.message || "Failed to process job"
        );
      }
    } catch (error: any) {
      console.error("Error processing job:", error);
      setErrorMessage(
        error.response?.data?.errors?.join(", ") ||
          error.response?.data?.message ||
          error.message ||
          "Failed to process job. Please try again."
      );
    }
  }, [
    formData,
    selectedLocation,
    stateOptions,
    deletedAttachments,
    setShowConfirmationModal,
    setShowSuccessModal,
    setErrorMessage,
    setDeletedAttachments,
  ]);

  // Handle cancel action
  const handleCancel = useCallback(() => {
    const hasFormData = Object.values(formData).some(
      (value) =>
        (typeof value === "string" && value.trim() !== "") ||
        (Array.isArray(value) && value.length > 0)
    );
    if (hasFormData) {
      setShowCancelConfirmationModal(true);
    } else {
      router.back();
    }
  }, [formData, setShowCancelConfirmationModal]);

  // Discard changes and go back
  const handleDiscardChanges = useCallback(() => {
    setShowCancelConfirmationModal(false);
    router.back();
  }, [setShowCancelConfirmationModal]);

  // Save as draft functionality
  const handleSaveChanges = useCallback(async () => {
    try {
      if (!formData.title || formData.title.trim() === "") {
        setErrorMessage("Title is required to save draft");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("duration", formData.duration || "1 Month");
      formDataToSend.append("price", formData.price ? formData.price.toString() : "0");
      formDataToSend.append("isNegotiable", formData.isNegotiable.toString());
      formDataToSend.append("date", formData.date ? formData.date.toISOString() : new Date().toISOString());
      formDataToSend.append("time", formData.time ? formData.time.toISOString() : new Date().toISOString());

      const stateIndex = stateOptions.indexOf(formData.state) + 1;
      formDataToSend.append("state", stateIndex > 0 ? stateIndex.toString() : "1");

      formDataToSend.append("city", formData.city || "");
      formDataToSend.append("zipCode", formData.zipCode || "");
      formDataToSend.append(
        "location",
        JSON.stringify({
          name: selectedLocation?.name || formData.location || "TBD",
          address: selectedLocation?.address || formData.location || "TBD",
          coordinates: [Number(formData.longitude) || 0, Number(formData.latitude) || 0],
        })
      );

      formDataToSend.append("range", formData.range ? formData.range.match(/\d+/)?.[0] || "" : "");
      formDataToSend.append("categories", formData.categories || "");
      formDataToSend.append("genres", formData.genres || "");
      formDataToSend.append("languages", formData.languages || "");
      formDataToSend.append("gender", formData.gender || "");

      // Handle attachments
      const existingAttachments = formData.attachments
        .filter((file) => file.uri.startsWith("http") || file.uri.startsWith("/Uploads/"))
        .map((file) => ({
          name: file.name,
          url: file.uri.startsWith("/Uploads/") ? `http://localhost:3000${file.uri}` : file.uri,
          type: file.type,
          size: file.size,
        }));

      formDataToSend.append("existingAttachments", JSON.stringify(existingAttachments));

      if (deletedAttachments.length > 0) {
        formDataToSend.append("deletedAttachments", JSON.stringify(deletedAttachments));
      }

      const newFiles = formData.attachments.filter(
        (file) => !file.uri.startsWith("http") && !file.uri.startsWith("/Uploads/")
      );
      newFiles.forEach((file) => {
        formDataToSend.append("attachments", {
          uri: Platform.OS === "ios" ? file.uri.replace("file://", "") : file.uri,
          name: file.name,
          type: file.type,
        } as any);
      });

      // Enhanced logging for debugging
      console.log('FormData to send:', {
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        price: formData.price,
        isNegotiable: formData.isNegotiable,
        date: formData.date.toISOString(),
        time: formData.time.toISOString(),
        state: stateIndex,
        city: formData.city,
        zipCode: formData.zipCode,
        location: JSON.stringify({
          name: selectedLocation?.name || formData.location || "TBD",
          address: selectedLocation?.address || formData.location || "TBD",
          coordinates: [formData.longitude || 0, formData.latitude || 0],
        }),
        range: formData.range ? formData.range.match(/\d+/)?.[0] || "" : "",
        categories: formData.categories,
        genres: formData.genres,
        languages: formData.languages,
        gender: formData.gender,
        existingAttachments,
        deletedAttachments,
        newFiles,
      });

      const endpoint = formData.id ? `/api/jobs/job/${formData.id}` : "/api/jobs/draft";
      const method = formData.id ? api.patch : api.post;

      const response = await method(endpoint, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setShowCancelConfirmationModal(false);
        setShowSuccessModal(true);
        setDeletedAttachments([]);
        setTimeout(() => {
          setShowSuccessModal(false);
          router.back();
        }, 2000);
      } else {
        setErrorMessage(
          response.data.errors?.join(", ") || response.data.message || "Failed to save draft"
        );
      }
    } catch (error: any) {
      console.error("Error saving draft:", error);
      setErrorMessage(
        error.response?.data?.errors?.join(", ") ||
          error.response?.data?.message ||
          error.message ||
          "Failed to save draft"
      );
    }
  }, [
    formData,
    selectedLocation,
    stateOptions,
    deletedAttachments,
    setShowCancelConfirmationModal,
    setShowSuccessModal,
    setErrorMessage,
    setDeletedAttachments,
  ]);

  // Navigation handler
  const handleNotificationPress = () => {
    router.push("/(tabs)/notifications");
  };

  // Render step header with progress
  const renderStepHeader = () => (
    <View className="bg-white pt-0">
      <Header
        title={formData.id ? "Edit Job Post" : "New Job Post"}
        showNotification={true}
        onNotificationPress={handleNotificationPress}
      />
      <View className="px-4 mt-2">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-xl font-bold">
            {
              [
                "General Details",
                "Talent Category & Skills",
                "Attachments",
                "Review & Post",
              ][currentStep - 1]
            }
          </Text>
          <View className="flex-row items-center">
            <View className="bg-red-500 rounded-full w-7 h-7 items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {currentStep}
              </Text>
            </View>
            <Text className="text-gray-500 text-xs ml-1">of 4</Text>
          </View>
        </View>
        <View className="flex-row h-1 w-full mb-6 space-x-1">
          {[1, 2, 3, 4].map((step) => (
            <View
              key={step}
              className={`h-1 rounded-full flex-1 ${
                currentStep >= step ? "bg-red-500" : "bg-gray-200"
              }`}
            />
          ))}
        </View>
      </View>
    </View>
  );

  // Step 1: General Details Form
  const renderStep1Content = () => (
    <View className="px-4 mt-9">
      <View className="mb-4">
        <Text className="font-medium mb-1">
          Post Title<Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 text-gray-700"
          placeholder="Write post title"
          value={formData.title}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, title: text }))
          }
        />
      </View>

      <View className="mb-4">
        <Text className="font-medium mb-1">
          Description<Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 h-24 text-gray-700"
          placeholder="Write description"
          multiline
          maxLength={250}
          value={formData.description}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, description: text }))
          }
        />
        <Text className="text-gray-500 text-xs mt-1">250 words max</Text>
      </View>

      <View className="mb-4 relative">
        <Text className="font-medium mb-1">
          Job Active Duration<Text className="text-red-500">*</Text>
        </Text>
        <TouchableOpacity
          className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
          onPress={() => setShowDurationOptions((prev) => !prev)}
        >
          <Text className={formData.duration ? "text-gray-700" : "text-gray-400"}>
            {formData.duration || "Select Duration"}
          </Text>
          <Assets.icons.downArrow width={16} height={16} fill="none" />
        </TouchableOpacity>
        {showDurationOptions && (
          <View className="border border-gray-300 rounded-lg mt-1 absolute top-16 left-0 right-0 bg-white z-10 shadow-lg">
            {durationOptions.map((option) => (
              <TouchableOpacity
                key={option}
                className="p-3 border-b border-gray-200 last:border-b-0"
                onPress={() => {
                  setFormData((prev) => ({ ...prev, duration: option }));
                  setShowDurationOptions(false);
                }}
              >
                <Text className="text-gray-700">{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View className="mb-4 relative">
        <Text className="font-medium mb-1">
          Price<Text className="text-red-500">*</Text>
        </Text>
        <View className="flex-row">
          <TextInput
            className="border border-gray-300 rounded-lg p-3 flex-1 mr-2 text-gray-700"
            placeholder="Ex: $100"
            keyboardType="numeric"
            value={formData.price}
            onChangeText={(text) => {
              if (/^\d*\.?\d*$/.test(text) || text === "") {
                setFormData((prev) => ({ ...prev, price: text }));
              }
            }}
          />
          <TouchableOpacity
            className="border border-gray-300 rounded-lg p-3 flex-1 ml-2 flex-row justify-between items-center"
            onPress={() => setShowNegotiableOptions((prev) => !prev)}
          >
            <Text className="text-gray-700">
              {formData.isNegotiable ? "Negotiable" : "Fixed"}
            </Text>
            <Assets.icons.downArrow width={16} height={16} fill="none" />
          </TouchableOpacity>
        </View>
        {showNegotiableOptions && (
          <View className="border border-gray-300 rounded-lg mt-1 absolute top-16 right-0 w-1/2 bg-white z-10 shadow-lg">
            {negotiableOptions.map((option) => (
              <TouchableOpacity
                key={option}
                className="p-3 border-b border-gray-200 last:border-b-0"
                onPress={() => {
                  setFormData((prev) => ({
                    ...prev,
                    isNegotiable: option === "Negotiable",
                  }));
                  setShowNegotiableOptions(false);
                }}
              >
                <Text className="text-gray-700">{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      <View className="mb-4">
        <View className="flex-row">
          <View className="flex-1 mr-2">
            <Text className="font-medium mb-1">
              Date<Text className="text-red-500">*</Text>
            </Text>
            <TouchableOpacity
              className="border border-gray-300 rounded-lg p-3"
              onPress={() => setShowDatePicker(true)}
            >
              <Text className="text-gray-700">{formatDate(formData.date)}</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-1 ml-2">
            <Text className="font-medium mb-1">
              Time<Text className="text-red-500">*</Text>
            </Text>
            <TouchableOpacity
              className="border border-gray-300 rounded-lg p-3"
              onPress={() => setShowTimePicker(true)}
            >
              <Text className="text-gray-700">{formatTime(formData.time)}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={formData.date}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={onDateChange}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={formData.time}
            mode="time"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={onTimeChange}
          />
        )}
      </View>

      <View className="mb-4 relative">
        <Text className="font-medium mb-1">
          Select State<Text className="text-red-500">*</Text>
        </Text>
        <TouchableOpacity
          className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
          onPress={() => setShowStateOptions((prev) => !prev)}
        >
          <Text className={formData.state ? "text-gray-700" : "text-gray-400"}>
            {formData.state || "Ex. California"}
          </Text>
          <Assets.icons.downArrow width={16} height={16} fill="none" />
        </TouchableOpacity>
        {showStateOptions && (
          <View className="border border-gray-300 rounded-lg mt-1 absolute top-16 left-0 right-0 bg-white z-10 shadow-lg max-h-60">
            <ScrollView
              contentContainerStyle={{ paddingBottom: 10 }}
            >
              {stateOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  className="p-3 border-b border-gray-200 last:border-b-0"
                  onPress={() => {
                    setFormData((prev) => ({ ...prev, state: option }));
                    setShowStateOptions(false);
                  }}
                >
                  <Text className="text-gray-700">{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View className="mb-4">
        <View className="flex-row">
          <View className="flex-1 mr-2">
            <Text className="font-medium mb-1">
              City<Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-gray-700"
              placeholder="Ex. California"
              value={formData.city}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, city: text }))
              }
            />
          </View>
          <View className="flex-1 ml-2">
            <Text className="font-medium mb-1">
              Zip Code<Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-gray-700"
              placeholder="Ex. 756294"
              keyboardType="numeric"
              value={formData.zipCode}
              onChangeText={(text) => {
                if (/^\d*$/.test(text) || text === "") {
                  setFormData((prev) => ({ ...prev, zipCode: text }));
                }
              }}
            />
          </View>
        </View>
      </View>

      <View className="mb-4">
        <Text className="font-medium mb-1">
          Location<Text className="text-red-500">*</Text>
        </Text>
        {selectedLocation ? (
  <TouchableOpacity
    className="border border-gray-300 rounded-lg overflow-hidden"
    onPress={() => setShowLocationModal(true)}
  >
    <View className="flex-row items-center p-3">
      <View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center mr-3">
        <Assets.icons.location width={16} height={16} fill="#EF4444" />
      </View>
      <View>
        <Text className="font-medium">{selectedLocation.name}</Text>
        <Text className="text-gray-500 text-sm">
          {selectedLocation.address}
        </Text>
      </View>
    </View>
    <View className="h-32 w-full">
      <MapView
        style={{ width: "100%", height: "100%" }}
        region={{
          latitude: Number(selectedLocation.latitude) || 37.78825,
          longitude: Number(selectedLocation.longitude) || -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
      >
        <Marker
          coordinate={{
            latitude: Number(selectedLocation.latitude) || 37.78825,
            longitude: Number(selectedLocation.longitude) || -122.4324,
          }}
        />
      </MapView>
    </View>
  </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
              onPress={() => setShowLocationModal(true)}
            >
              <Text className="text-gray-700">
                {formData.location || "Add Location"}
              </Text>
              <Assets.icons.downArrow width={16} height={16} fill="none" />
            </TouchableOpacity>
          )}
      </View>

      <View className="mb-4">
        <Text className="font-medium mb-1">Range</Text>
        <TouchableOpacity
          className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
          onPress={() => setRangeModalVisible(true)}
        >
          <Text className="text-gray-500">
            {selectedRange || "Select Range"}
          </Text>
          <Assets.icons.downArrow width={16} height={16} fill="none" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Step 2: Categories and Skills Selection
  const renderStep2Content = () => (
    <View className="px-4 mt-9">
      <View className="mb-4">
        <Text className="font-medium mb-1">
          Categories<Text className="text-red-500">*</Text>
        </Text>
        <TouchableOpacity
          className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
          onPress={() => setCategoryModalVisible(true)}
        >
          <Text className="text-gray-500">
            {selectedCategories.length > 0
              ? `${selectedCategories.length} selected`
              : "Select Categories"}
          </Text>
          <Assets.icons.downArrow width={16} height={16} fill="none" />
        </TouchableOpacity>
      </View>

      <View className="mb-4">
        <Text className="font-medium mb-1">
          Genres<Text className="text-red-500">*</Text>
        </Text>
        <TouchableOpacity
          className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
          onPress={() => setGenresModalVisible(true)}
        >
          <Text className="text-gray-500">
            {selectedGenres.length > 0
              ? `${selectedGenres.length} selected`
              : "Select Genres"}
          </Text>
          <Assets.icons.downArrow width={16} height={16} fill="none" />
        </TouchableOpacity>
      </View>

      <View className="mb-4">
        <Text className="font-medium mb-1">
          Languages<Text className="text-red-500">*</Text>
        </Text>
        <TouchableOpacity
          className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
          onPress={() => setLanguageModalVisible(true)}
        >
          <Text className="text-gray-500">
            {selectedLanguages.length > 0
              ? `${selectedLanguages.length} selected`
              : "Select Languages"}
          </Text>
          <Assets.icons.downArrow width={16} height={16} fill="none" />
        </TouchableOpacity>
      </View>

      <View className="mb-4">
        <Text className="font-medium mb-1">
          Genders<Text className="text-red-500">*</Text>
        </Text>
        <TouchableOpacity
          className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
          onPress={() => setGenderModalVisible(true)}
        >
          <Text className="text-gray-500">
            {selectedGenders.length > 0
              ? `${selectedGenders.length} selected`
              : "Select Genders"}
          </Text>
          <Assets.icons.downArrow width={16} height={16} fill="none" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // File size formatter
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Get appropriate icon for file type
  const getFileIcon = (type: string) => {
    if (type.includes("video"))
      return <Assets.icons.play width={24} height={24} fill="#FFFFFF" />;
    if (type.includes("audio"))
      return <Assets.icons.mic width={24} height={24} fill="#FFFFFF" />;
    if (type.includes("image"))
      return <Assets.icons.image width={24} height={24} fill="#FFFFFF" />;
    if (type.includes("pdf"))
      return <Assets.icons.document width={24} height={24} fill="#FFFFFF" />;
    return <Assets.icons.document width={24} height={24} fill="#FFFFFF" />;
  };

  // Step 3: File Attachments
  const renderStep3Content = () => (
    <View className="px-4 mt-9">
      <View className="mb-4">
        <Text className="font-medium mb-1">Attach Sample Material</Text>
        <Text className="text-gray-500 text-sm mb-4">
          Add video or audio samples for the artist to inform them what you're
          looking for.
        </Text>
        {formData.attachments.length > 0 ? (
          <View className="mb-4">
            {formData.attachments.map((file, index) => (
              <View
                key={index}
                className="flex-row items-center p-3 border border-gray-200 rounded-lg mb-2"
              >
                <View className="bg-gray-100 p-2 rounded mr-3">
                  {getFileIcon(file.type)}
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium">{file.name}</Text>
                  <Text className="text-gray-500 text-xs">
                    {formatFileSize(file.size)}
                  </Text>
                </View>
                <TouchableOpacity
                  className="p-2"
                  onPress={() => removeAttachment(index)}
                >
                  <Assets.icons.delete width={20} height={20} fill="#FF0000" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <TouchableOpacity
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 items-center justify-center mb-4"
            onPress={pickDocument}
          >
            <Assets.icons.download width={24} height={24} stroke="#9CA3AF" />
            <Text className="text-gray-500 font-medium mt-2 text-center">
              Tap & Choose Files to upload
            </Text>
            <Text className="text-gray-400 text-xs mt-1 text-center">
              Files Supported: Audio / Video / Document
            </Text>
          </TouchableOpacity>
        )}
        {formData.attachments.length > 0 && (
          <TouchableOpacity
            className="border border-gray-300 rounded-lg p-3 items-center justify-center"
            onPress={pickDocument}
          >
            <Text className="text-gray-700 font-medium">Add More Files</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Step 4: Review and Submit
  const renderStep4Content = () => (
    <View className="px-4 pt-6">
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-gray-500 text-sm">Title</Text>
          <TouchableOpacity onPress={() => setCurrentStep(1)} className="p-1">
            <Assets.icons.edit width={24} height={24} stroke="#000000" />
          </TouchableOpacity>
        </View>
        <Text className="text-gray-800 font-medium text-base">{formData.title}</Text>
      </View>

      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-gray-500 text-sm">Description</Text>
        </View>
        <Text className="text-gray-800">{formData.description}</Text>
      </View>

      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-gray-500 text-sm">Job Active Duration</Text>
        </View>
        <Text className="text-gray-800">{formData.duration}</Text>
      </View>

      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-gray-500 text-sm">Price</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-gray-800">${formData.price}</Text>
          {formData.isNegotiable && <Text className="text-gray-500 ml-2">Negotiable</Text>}
        </View>
      </View>

      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-gray-500 text-sm">Date & Time</Text>
        </View>
        <Text className="text-gray-800">{formatDate(formData.date)} at {formatTime(formData.time)}</Text>
      </View>

      <View className="mb-4">
        <View className="flex-row justify-between mb-1">
          <View className="flex-col">
            <Text className="text-gray-500 text-sm">State</Text>
            <Text className="text-gray-800">{formData.state || 'Not specified'}</Text>
          </View>
          <View className="flex-col">
            <Text className="text-gray-500 text-sm">City</Text>
            <Text className="text-gray-800">{formData.city || 'Not specified'}</Text>
          </View>
          <View className="flex-col">
            <Text className="text-gray-500 text-sm">Zip Code</Text>
            <Text className="text-gray-800">{formData.zipCode || 'Not specified'}</Text>
          </View>
        </View>
      </View>

      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-gray-500 text-sm">Location</Text>
        </View>
        <Text className="text-gray-800">{selectedLocation?.name || formData.location}</Text>
        <Text className="text-gray-500 text-sm">{selectedLocation?.address}</Text>
      </View>

      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-gray-500 text-sm">Range</Text>
        </View>
        <Text className="text-gray-800">{formData.range || 'Not specified'}</Text>
      </View>

      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-gray-500 text-sm">Categories</Text>
        </View>
        <View className="flex-row flex-wrap">
          {selectedCategories.map((category, index) => (
            <View key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
              <Text className="text-gray-800 mr-2">{category}</Text>
              <TouchableOpacity onPress={() => toggleCategory({ name: category, subcategory_id: 0 })}>
                <Text className="text-red-500 text-sm">×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-gray-500 text-sm">Genres</Text>
        </View>
        <View className="flex-row flex-wrap">
          {selectedGenres.map((genre, index) => (
            <View key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
              <Text className="text-gray-800 mr-2">{genre}</Text>
              <TouchableOpacity onPress={() => toggleGenre(genre)}>
                <Text className="text-red-500 text-sm">×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-gray-500 text-sm">Languages</Text>
        </View>
        <View className="flex-row flex-wrap">
          {selectedLanguages.map((language, index) => (
            <View key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
              <Text className="text-gray-800 mr-2">{language}</Text>
              <TouchableOpacity onPress={() => toggleLanguage(language)}>
                <Text className="text-red-500 text-sm">×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-gray-500 text-sm">Gender</Text>
        </View>
        <View className="flex-row flex-wrap">
          {selectedGenders.map((gender, index) => (
            <View key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
              <Text className="text-gray-800 mr-2">{gender}</Text>
              <TouchableOpacity onPress={() => toggleGender(gender)}>
                <Text className="text-red-500 text-sm">×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-gray-500 text-sm">Attachments</Text>
        </View>
        {formData.attachments.map((file, index) => (
          <View key={index} className="flex-row items-center p-3 bg-gray-100 rounded-lg mb-2">
            <View className="bg-gray-300 p-2 rounded-full mr-3">
              {getFileIcon(file.type)}
            </View>
            <View className="flex-1">
              <Text className="text-gray-800">{file.name}</Text>
              <Text className="text-gray-500 text-xs">{formatFileSize(file.size)}</Text>
            </View>
            <TouchableOpacity onPress={() => removeAttachment(index)}>
              <Text className="text-gray-500 text-xl">×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  // Location selection modal
  const renderLocationModal = () => (
    <Modal
      visible={showLocationModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowLocationModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowLocationModal(false)}>
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-t-xl p-4">
              {isLocationLoading ? (
                <LocationLoader />
              ) : (
                <>
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-bold">Add Location</Text>
                    <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                      <Text className="text-xl font-bold text-gray-500">×</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    className="p-4 border-b border-gray-200 flex-row items-center"
                    onPress={handleAddCurrentLocation}
                  >
                    <Text className="text-gray-700 text-base">
                      Add Current Location
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="p-4 flex-row items-center"
                    onPress={() => {
                      setShowLocationModal(false);
                      setShowMapScreen(true);
                    }}
                  >
                    <Text className="text-gray-700 text-base">Select on Map</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  // Map screen for location selection
  const renderMapScreen = () => showMapScreen && (
    <Modal visible={showMapScreen} animationType="slide">
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <Text className="text-lg font-semibold">Choose Location</Text>
          <TouchableOpacity onPress={() => setShowMapScreen(false)}>
            <Text className="text-xl">×</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-1">
          {mapError ? (
            <View className="flex-1 justify-center items-center p-4">
              <Text className="text-red-500 text-center mb-4">{mapError}</Text>
              <TouchableOpacity
                className="bg-red-500 rounded-lg px-4 py-2"
                onPress={() => {
                  setMapError(null);
                  setShowMapScreen(false);
                }}
              >
                <Text className="text-white">Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <MapView
              style={{ width: "100%", height: "100%" }}
              initialRegion={{
                latitude: Number(mapRegion.latitude) || 37.78825,
                longitude: Number(mapRegion.longitude) || -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              region={{
                latitude: Number(mapRegion.latitude) || 37.78825,
                longitude: Number(mapRegion.longitude) || -122.4324,
                latitudeDelta: mapRegion.latitudeDelta || 0.0922,
                longitudeDelta: mapRegion.longitudeDelta || 0.0421,
              }}
              onMapReady={() => {
                console.log('Map is ready');
                setIsMapReady(true);
                setMapError(null);
              }}
              onRegionChangeComplete={(region) => {
                if (isMapReady) {
                  console.log('onRegionChangeComplete:', JSON.stringify(region, null, 2));
                  setMapRegion({
                    latitude: Number(region.latitude) || 37.78825,
                    longitude: Number(region.longitude) || -122.4324,
                    latitudeDelta: region.latitudeDelta,
                    longitudeDelta: region.longitudeDelta,
                  });
                }
              }}
              loadingEnabled={true}
              loadingIndicatorColor="#666666"
              loadingBackgroundColor="#ffffff"
            >
              <Marker
                coordinate={{
                  latitude: Number(mapRegion.latitude) || 37.78825,
                  longitude: Number(mapRegion.longitude) || -122.4324,
                }}
                draggable
                onDragEnd={(e) => {
                  console.log('onDragEnd:', JSON.stringify(e.nativeEvent.coordinate, null, 2));
                  setMapRegion({
                    latitude: Number(e.nativeEvent.coordinate.latitude) || 37.78825,
                    longitude: Number(e.nativeEvent.coordinate.longitude) || -122.4324,
                    latitudeDelta: mapRegion.latitudeDelta,
                    longitudeDelta: mapRegion.longitudeDelta,
                  });
                }}
              />
            </MapView>
          )}
          <View className="absolute bottom-0 left-0 right-0 p-4">
            <TouchableOpacity
              className="bg-red-500 rounded-lg p-4"
              onPress={handleMapLocationSelect}
            >
              <Text className="text-white text-center font-semibold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );

  // Categories selection modal
  const renderCategoryModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={categoryModalVisible}
      onRequestClose={() => setCategoryModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setCategoryModalVisible(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-t-3xl max-h-[80%]">
              <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
                <Text className="text-xl font-bold text-black">
                  Select Categories
                </Text>
                <TouchableOpacity
                  onPress={() => setCategoryModalVisible(false)}
                >
                  <Text className="text-2xl">×</Text>
                </TouchableOpacity>
              </View>
              <ScrollView className="p-5">
                {categoryData.map((section, sectionIndex) => (
                  <View key={sectionIndex} className="mb-3">
                    <Text className="text-sm font-medium text-gray-500 py-1">
                      {section.section}
                    </Text>
                    {section.items.map((item, itemIndex) => (
                      <TouchableOpacity
                        key={`${sectionIndex}-${itemIndex}`}
                        className="py-3 flex-row items-center"
                        onPress={() => toggleCategory(item)}
                      >
                        <View
                          className={`w-5 h-5 border border-gray-300 rounded mr-3 justify-center items-center ${
                            selectedCategories.includes(item.name)
                              ? "bg-red-500 border-red-500"
                              : ""
                          }`}
                        >
                          {selectedCategories.includes(item.name) && (
                            <Text className="text-white text-xs">✓</Text>
                          )}
                        </View>
                        <Text
                          className={`text-base ${
                            selectedCategories.includes(item.name)
                              ? "text-red-500 font-medium"
                              : "text-gray-800"
                          }`}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  // Genres selection modal
  const renderGenresModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={genresModalVisible}
      onRequestClose={() => setGenresModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setGenresModalVisible(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-t-3xl max-h-[80%]">
              <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
                <Text className="text-xl font-bold text-black">
                  Select Genres
                </Text>
                <TouchableOpacity onPress={() => setGenresModalVisible(false)}>
                  <Text className="text-2xl">×</Text>
                </TouchableOpacity>
              </View>
              <ScrollView className="p-5">
                {genresOptions.map((genre, index) => (
                  <TouchableOpacity
                    key={index}
                    className="py-3 flex-row items-center"
                    onPress={() => toggleGenre(genre)}
                  >
                    <View
                      className={`w-5 h-5 border border-gray-300 rounded mr-3 justify-center items-center ${
                        selectedGenres.includes(genre) ? "bg-red-500" : ""
                      }`}
                    >
                      {selectedGenres.includes(genre) && (
                        <Text className="text-white">✓</Text>
                      )}
                    </View>
                    <Text
                      className={`text-base ${
                        selectedGenres.includes(genre)
                          ? "text-red-500 font-medium"
                          : "text-gray-800"
                      }`}
                    >
                      {genre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  // Languages selection modal
  const renderLanguageModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={languageModalVisible}
      onRequestClose={() => setLanguageModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setLanguageModalVisible(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-t-3xl max-h-[80%]">
              <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
                <Text className="text-xl font-bold text-black">
                  Select Languages
                </Text>
                <TouchableOpacity
                  onPress={() => setLanguageModalVisible(false)}
                >
                  <Text className="text-2xl">×</Text>
                </TouchableOpacity>
              </View>
              <ScrollView className="p-5">
                {languageOptions.map((lang, index) => (
                  <TouchableOpacity
                    key={index}
                    className="py-3 flex-row items-center"
                    onPress={() => toggleLanguage(lang)}
                  >
                    <View
                      className={`w-5 h-5 border border-gray-300 rounded mr-3 justify-center items-center ${
                        selectedLanguages.includes(lang) ? "bg-red-500" : ""
                      }`}
                    >
                      {selectedLanguages.includes(lang) && (
                        <Text className="text-white">✓</Text>
                      )}
                    </View>
                    <Text
                      className={`text-base ${
                        selectedLanguages.includes(lang)
                          ? "text-red-500 font-medium"
                          : "text-gray-800"
                      }`}
                    >
                      {lang}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  // Genders selection modal
  const renderGenderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={genderModalVisible}
      onRequestClose={() => setGenderModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setGenderModalVisible(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-t-3xl max-h-[80%]">
              <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
                <Text className="text-xl font-bold text-black">
                  Select Genders
                </Text>
                <TouchableOpacity onPress={() => setGenderModalVisible(false)}>
                  <Text className="text-2xl">×</Text>
                </TouchableOpacity>
              </View>
              <ScrollView className="p-5">
                {genderOptions.map((gender, index) => (
                  <TouchableOpacity
                    key={index}
                    className="py-3 flex-row items-center"
                    onPress={() => toggleGender(gender)}
                  >
                    <View
                      className={`w-5 h-5 border border-gray-300 rounded mr-3 justify-center items-center ${
                        selectedGenders.includes(gender) ? "bg-red-500" : ""
                      }`}
                    >
                      {selectedGenders.includes(gender) && (
                        <Text className="text-white">✓</Text>
                      )}
                    </View>
                    <Text
                      className={`text-base ${
                        selectedGenders.includes(gender)
                          ? "text-red-500 font-medium"
                          : "text-gray-800"
                      }`}
                    >
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  // Range selection modal
  const renderRangeModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={rangeModalVisible}
      onRequestClose={() => setRangeModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setRangeModalVisible(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-t-3xl max-h-[80%]">
              <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
                <Text className="text-xl font-bold text-black">
                  Select Range
                </Text>
                <TouchableOpacity onPress={() => setRangeModalVisible(false)}>
                  <Text className="text-2xl">×</Text>
                </TouchableOpacity>
              </View>
              <ScrollView className="p-5">
                {rangeOptions.map((range, index) => (
                  <TouchableOpacity
                    key={index}
                    className="py-3 flex-row items-center"
                    onPress={() => selectRange(range)}
                  >
                    <Text
                      className={`text-base ${
                        selectedRange === range
                          ? "text-red-500 font-medium"
                          : "text-gray-800"
                      }`}
                    >
                      {range}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  // Main component render
  // Calculate dynamic padding based on header and message visibility
  const hasMessage = errorMessage || isLocationPermissionDenied;
  const headerHeight = 120; // Header height (Header + step indicator)
  const messageHeight = hasMessage ? 50 : 0;
  // Add top inset to header height for safe area
  const dynamicPaddingTop = headerHeight;
  
  return (
    <View className="flex-1 bg-white">
      {/* Fixed Header */}
      <View className="absolute top-0 left-0 right-0 z-10" style={{ paddingTop: 0 }}>
        {renderStepHeader()}
      </View>

      {/* Error Message Display */}
      {errorMessage ? (
        <View className="absolute left-0 right-0 z-10" style={{ top: headerHeight + insets.top + 5 }}>
          <View className="bg-red-100 p-3 mx-4 rounded-lg">
            <Text className="text-red-600">{errorMessage}</Text>
          </View>
        </View>
      ) : null}

      {/* Location Permission Denied Message */}
      {isLocationPermissionDenied && !errorMessage ? (
        <View className="left-0 right-0 z-10" style={{ top: headerHeight }}>
          <View className="bg-blue-50 border border-blue-200 p-4 mx-4 rounded-lg">
            <Text className="text-gray-700 text-sm">
              For better experience{' '}
              <Text className="text-blue-600 font-semibold underline" onPress={openLocationSettings}>
                turn on
              </Text>
              {' '}device location
            </Text>
          </View>
        </View>
      ) : null}

      {/* Main Content Area */}
      <View className="flex-1">
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{ 
            paddingTop: dynamicPaddingTop, 
            paddingBottom: 80 + insets.bottom // Action buttons height (~80px) + safe area bottom
          }}
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 1
            ? renderStep1Content()
            : currentStep === 2
            ? renderStep2Content()
            : currentStep === 3
            ? renderStep3Content()
            : renderStep4Content()}
        </ScrollView>
      </View>

      {/* Fixed Bottom Action Buttons */}
      <View 
        className="absolute left-0 right-0 p-4 bg-white border-t border-gray-200 z-10"
        style={{ bottom: 0 }}
      >
        <ActionButtons
          onCancel={handleCancel}
          onPrimaryAction={currentStep === 4 ? handlePostJob : handleContinue}
          primaryText={
            currentStep === 3
              ? "Review & Post Job"
              : currentStep === 4
              ? "Post Job"
              : "Continue"
          }
          containerStyle="flex-row space-x-4"
        />
      </View>

      {/* All Modals */}
      {renderLocationModal()}
      {renderMapScreen()}
      {renderCategoryModal()}
      {renderGenresModal()}
      {renderLanguageModal()}
      {renderGenderModal()}
      {renderRangeModal()}

      {/* Confirmation Modals */}
      <AlertModal
        visible={showConfirmationModal}
        title=""
        message="You're about to post your job. Are you sure you want to proceed?"
        icon={
          <View className="w-14 h-14 rounded-full bg-yellow-50 items-center justify-center">
            <Assets.icons.warning width={24} height={24} fill="#F59E0B" />
          </View>
        }
        primaryButtonText="Post Job"
        secondaryButtonText="Cancel"
        onPrimaryButtonPress={confirmPostJob}
        onSecondaryButtonPress={() => setShowConfirmationModal(false)}
        onClose={() => setShowConfirmationModal(false)}
      />

      <AlertModal
        visible={showCancelConfirmationModal}
        message="You're about to leave this page! Would you like to save changes or discard?"
        icon={
          <View className="w-14 h-14 rounded-full bg-yellow-50 items-center justify-center">
            <Assets.icons.warning width={24} height={24} fill="#F59E0B" />
          </View>
        }
        primaryButtonText="Save Changes"
        secondaryButtonText="Discard"
        onPrimaryButtonPress={handleSaveChanges}
        onSecondaryButtonPress={handleDiscardChanges}
        onClose={() => setShowCancelConfirmationModal(false)}
      />
      
      <AlertModal
        visible={showSuccessModal}
        message="Changes have been saved."
        icon={
          <View className="w-14 h-14 rounded-full bg-green-50 items-center justify-center">
            <Assets.icons.successRight width={24} height={24} fill="#22C55E" />
          </View>
        }
        primaryButtonText=""
        onPrimaryButtonPress={() => {}}
        onClose={() => setShowSuccessModal(false)}
      />
    </View>
  );
};

export default JobPostForm;