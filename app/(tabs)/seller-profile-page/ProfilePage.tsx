import Assets from "@/assets"; // Updated to match CalendarModal's import path
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ActionButtons from "../components/buttons/action-button";
import CalendarModal from "../components/CalendarModal";
import RenderHRML, { RenderHTML } from 'react-native-render-html'
import PortfolioItem from "./PortfolioItem";
import SellerReview from "./SellerReview";
import PortfolioItems from "./PortfolioItems";
// import { WebView } from 'react-native-webview';

// Define the structure of profileData (same as in Profile.tsx)
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
  // portfolio: Array<{ url: string; title: string; location: string; type: 'video' | 'audio' }>;
  portfolio: Array<{ url: string; title: string; location: string; type: 'video' | 'audio' | 'image' }>;
  certificates: Array<{ name: string; date: string; institution: string }>;
  education: Array<{ degree: string; date: string; institution: string }>;
  stories: Array<{ url: string; type: 'video' | 'image'; created_at: string }>;
  rating: number;
  reviews: number;
  created_at: string;
  updated_at: string;
  isFavorite: boolean;
}

interface ProfilePageProps {
  profileData: ProfileData | null;
  loading: boolean;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profileData, loading }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [availabilityDates, setAvailabilityDates] = useState<Date[]>([]);
  const [nextAvailableDate, setNextAvailableDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null); // For availability errors
  const currentDate = new Date(2025, 5, 5); // Today: June 5, 2025

  //########################################
  //This is for testing
  const html1 = <p>This is the Test data
  <h1>hipp</h1></p>
  // Fetch availability dates and calculate the next available date
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        // Replace with actual API call in a real app
        /*
        const response = await fetch(`/api/bookings/${profileData.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }
        const data = await response.json();
        const bookedDates = data.bookings
          .filter((booking: any) => booking.status === "booked")
          .map((booking: any) => new Date(booking.date));
        */

        // Hardcoded booked dates for now
        const bookedDatesFromDB = [
          new Date(2025, 5, 5), // June 5, 2025 (today, booked)
          new Date(2025, 5, 7), // June 7, 2025
          new Date(2025, 5, 10), // June 10, 2025
          new Date(2025, 5, 12), // June 12, 2025
        ];

        setAvailabilityDates(bookedDatesFromDB);

        // Calculate the next available date
        let tempDate = new Date(currentDate);
        let foundNextAvailable = false;

        while (!foundNextAvailable) {
          tempDate.setDate(tempDate.getDate() + 1); // Move to the next day
          const isBooked = bookedDatesFromDB.some(
            (bookedDate) =>
              bookedDate.getDate() === tempDate.getDate() &&
              bookedDate.getMonth() === tempDate.getMonth() &&
              bookedDate.getFullYear() === tempDate.getFullYear()
          );

          if (!isBooked) {
            setNextAvailableDate(new Date(tempDate));
            foundNextAvailable = true;
          }

          // Safety check to prevent infinite loop (e.g., check up to 1 year)
          if (tempDate > new Date(2026, 5, 5)) {
            setNextAvailableDate(null); // No available date found within a year
            break;
          }
        }
      } catch (err) {
        console.error("Error fetching availability:", err);
        setError("Failed to load availability dates");
        setAvailabilityDates([]);
        setNextAvailableDate(null);
      }
    };

    if (profileData?.id) {
      fetchAvailability();
    }
  }, [profileData?.id]); // Re-run if profileData.id changes

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleSendMessage = () => {
    if (profileData?.id) {
      router.push({
        pathname: "/(tabs)/messages",
        params: { id: profileData.id },
      });
    } else {
      router.push("/(tabs)/messages");
    }
  };

  const handleHire = () => {
    console.log("Hire button pressed for profile:", profileData?.id);
    router.push('/(tabs)/SendOffer')
    // Add backend call to initiate hiring process, e.g.:
    // fetch(`/api/hire/${profileData.id}`, { method: "POST" })
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    );
  }

  if (!profileData || error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-gray-700 text-center font-bold">
          {error || "Profile not found or error loading profile data."}
        </Text>
      </View>
    );
  }
  console.log("Thsi is profile image",profileData)

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="px-4 py-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-row items-center flex-1">
              <Image
                source={
                  typeof profileData.image === "string"
                    ? { uri: profileData.image } // remote image
                    : profileData.image          // local require
                }
                className="w-12 h-12 rounded-full"
              />

              <View className="ml-3 flex-1">
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Text className="text-lg font-semibold">
                      {profileData.name}
                    </Text>
                    <Assets.icons.star width={18} height={18} fill="#FFD700" />
                    <Text className="text-gray-500 text-xs ml-2">
                      {profileData.rating} ({profileData.reviews})
                    </Text>
                  </View>
                  <View
                    className={`${profileData.badgeColor} px-2 py-1 rounded`}
                  >
                    <Text className="text-white text-xs">
                      {profileData.badge}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center mt-1">
                  <Text className="text-gray-500 text-base mr-2">{profileData.city}</Text>
                  <Assets.icons.aeroplane
                    width={12}
                    height={12}
                    fill="#000000"
                    className="ml-2"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Latest Availability */}
          <View className="mt-4">
            <Text className="text-gray-500 text-base">Latest Availability:</Text>
            <View className="flex-row justify-between items-center mt-1 border border-gray-200 p-2 rounded-lg">
              <Text className="text-sm font-medium">
                {nextAvailableDate
                  ? nextAvailableDate.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : profileData.availability || "Not Available"}
              </Text>
              <TouchableOpacity onPress={() => setShowCalendar(true)}>
                <Assets.icons.calendar
                  width={24}
                  height={24}
                  stroke="#9CA3AF"
                  strokeWidth="1.5"
                  fill="none"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Job History */}
          <View className="mt-4">
            <Text className="text-gray-700 text-base font-medium">
              Job History
            </Text>
            <View className="flex-row mt-2 bg-gray-100 rounded-lg">
              <View className="flex-1 py-3 items-center">
                <Text className="font-bold text-lg">
                  {24}
                  {/* {profileData.jobsCompleted || 24} */}
                </Text>
                <Text className="text-gray-600 text-base">Jobs Completed</Text>
              </View>
              <View className="flex-1 py-3 items-center">
                <Text className="font-bold text-lg">
                  {/* {profileData.jobsInProgress ||1} */}
                  {3}
                </Text>
                <Text className="text-gray-600 text-base">Jobs In Progress</Text>
              </View>
            </View>
          </View>

          {/* General Profile Dropdown */}
          <View className="mt-4">
            <TouchableOpacity
              className="border border-red-400 rounded-lg py-2 px-3 flex-row justify-between items-center"
              onPress={() => toggleSection("general")}
            >
              <Text className="text-gray-700 text-base">General Profile</Text>
              <View className="w-5 h-5 justify-center items-center">
                {expandedSection === "general" ? (
                  <Assets.icons.upArrow width={16} height={16} />
                ) : (
                  <Assets.icons.downArrow width={16} height={16} />
                )}
              </View>
            </TouchableOpacity>

            {expandedSection === "general" && (
              <View className="mt-2 border border-gray-200 rounded-lg">
                <TouchableOpacity
                  className="py-3 px-3 border-b border-gray-200"
                  onPress={() => {
                    console.log("Singer option selected");
                    setExpandedSection(null);
                  }}
                >
                  <Text className="text-gray-700">Singer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="py-3 px-3"
                  onPress={() => {
                    console.log("Guitarist option selected");
                    setExpandedSection(null);
                  }}
                >
                  <Text className="text-gray-700">Guitarist</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Description and Other Sections */}
        <View className="px-4">
          <View className="border-b border-gray-200 pb-4">
          <Text className="text-2xl font-bold leading-tight">
            {profileData.description}
          </Text>
          <Text className="text-lg font-bold mt-2">${profileData.price_range.min} to ${profileData.price_range.max}</Text>

          {/* <Text className="mt-3 text-gray-700 text-sm leading-relaxed">
            {profileData.long_description}
          </Text> */}
          <RenderHTML source={{ html: profileData.long_description }}
      />
      </View>
          {/* Work History Section */}
          {/* <View className="mt-6">
            <Text className="font-bold text-xl mb-3">Work History</Text>
            {profileData.workHistory.map((review, index: number) => (
              <View key={index} className="mb-4 pb-4 border-b border-gray-200">
                <View className="flex-row justify-between items-start">
                  <Text className="text-sm text-gray-700">
                    {review.location}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-yellow-500 mr-1">★★★★★</Text>
                    <Text className="text-sm font-medium">{review.rating}</Text>
                  </View>
                </View>
                <Text className="text-xs text-gray-500 mb-2">
                  {review.date}
                </Text>
                <View className="mb-3">
                  <Text className="text-xs text-gray-700 mb-2">Services:</Text>
                  <View className="flex-row flex-wrap">
                    {review.services
                      .split(", ")
                      .map((service: string, serviceIndex: number) => (
                        <View
                          key={serviceIndex}
                          className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2"
                        >
                          <Text className="text-xs text-gray-700">
                            {service}
                          </Text>
                        </View>
                      ))}
                  </View>
                </View>
                <Text className="text-sm text-gray-700 leading-relaxed">
                  {review.text}
                </Text>
              </View>
            ))}
          </View> */}
          <SellerReview />

          {/* Portfolio Section */}
          {/* <View className="mt-6">
            <Text className="font-bold text-xl mb-3">Portfolio</Text>
            <View className="flex-row flex-wrap">
              <View className="w-1/2 pr-2 mb-3">
                <View className="bg-gray-200 rounded-lg aspect-video items-center justify-center relative">
                  <Assets.icons.play width={24} height={24} fill="#FFFFFF" />
                  <View className="absolute inset-0 flex items-center justify-center"></View>
                </View>
                <Text className="text-sm font-medium mt-1">Video Title</Text>
                <Text className="text-xs text-gray-500">
                  {profileData.location}
                </Text>
              </View>
              <View className="w-1/2 pl-2 mb-3">
                <View className="bg-gray-200 rounded-lg aspect-video items-center justify-center relative">
                  <Assets.icons.play width={24} height={24} fill="#FFFFFF" />
                  <View className="absolute inset-0 flex items-center justify-center"></View>
                </View>
                <Text className="text-sm font-medium mt-1">Video Title</Text>
                <Text className="text-xs text-gray-500">
                  {profileData.location}
                </Text>
              </View>
              <View className="w-1/2 pr-2 mb-3">
                <View className="bg-gray-200 rounded-lg aspect-video items-center justify-center">
                  <Assets.icons.mic width={24} height={24} fill="#000000" />
                </View>
                <Text className="text-sm font-medium mt-1">Audio Title</Text>
                <Text className="text-xs text-gray-500">
                  {profileData.location}
                </Text>
              </View>
              <View className="w-1/2 pl-2 mb-3">
                <View className="bg-gray-200 rounded-lg aspect-video items-center justify-center">
                  <Assets.icons.mic width={24} height={24} fill="#000000" />
                </View>
                <Text className="text-sm font-medium mt-1">Audio Title</Text>
                <Text className="text-xs text-gray-500">
                  {profileData.location}
                </Text>
              </View>
            </View>
          </View> */}

          {/* Portfolio Section */}
          <View className="mt-0">
            <Text className="font-semibold text-xl mb-3">Portfolio</Text>
            <View className="flex-row flex-wrap border-b border-gray-200 pb-4">
              {profileData.portfolio.length > 0 ? (
                profileData.portfolio.map((item, index) => (

                  <PortfolioItem key={index} item={item} />

                ))
              ) : (
                <Text className="text-sm text-gray-500">No portfolio items available</Text>
              )}
            </View>
          </View>

          {/* Services */}
          {/* <View className="mt-6">
            <Text className="font-bold text-xl mb-3">Services</Text>
            <View className="flex-row flex-wrap">
              {profileData.services.map((service: string, index: number) => (
                <View
                  key={index}
                  className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2"
                >
                  <Text className="text-sm text-gray-700">{service}</Text>
                </View>
              ))}
            </View>
          </View> */}

          {/* Services */}
          <View className="mt-6">
            <Text className="font-bold text-xl mb-3 ">Services</Text>
            <View className="flex-row flex-wrap border-b border-gray-200 pb-4">
              {profileData.services.map((service, index) => (
                <View key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
                  <Text className="text-sm text-gray-700">{service}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Performing Languages */}
          <View className="mt-6">
            <Text className="font-bold text-xl mb-3 ">Performing Languages</Text>
            <View className="flex-row flex-wrap border-b border-gray-200 pb-4">
              {profileData.languages.map((language: string, index: number) => (
                <View
                  key={index}
                  className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2"
                >
                  <Text className="text-sm text-gray-700">{language}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Education */}
          <View className="mt-6">
            <Text className="font-bold text-xl mb-3">Education</Text>
            <View className="border-gray-300 pl-1 border-b pb-4">
              {profileData.education.map((edu, index: number) => (
                <View
                  className="mb-4 flex-row items-start space-x-3"
                  key={index}
                >
                  <View className="bg-gray-200 rounded-full p-4 mr-3">
                    <Assets.icons.education
                      width={24}
                      height={24}
                      fill="#000000"
                    />
                  </View>
                  <View>
                    <Text className="font-medium text-base">{edu.degree}</Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      {edu.date}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {edu.institution}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Certificates */}
          <View className="mt-6">
            <Text className="font-bold text-xl mb-3">Certificates</Text>
            <View className="border-gray-200 border-b pb-4 pl-1">
              {profileData.certificates.map((cert, index: number) => (
                <View
                  className="mb-4 flex-row items-start space-x-3"
                  key={index}
                >
                  <View className="bg-gray-200 rounded-full p-4 mr-3">
                    <Assets.icons.certificate
                      width={24}
                      height={24}
                      fill="#000000"
                    />
                  </View>
                  <View>
                    <Text className="font-medium text-base">{cert.name}</Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      {cert.date}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {cert.institution}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          {/* WebView */}
          {/* <View className="mt-6 mb-6 h-[400px] overflow-hidden rounded-xl">
            <WebView
              originWhitelist={['*']}
              source={{
                html: `
                  <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <style>
                        body { font-size: 16px; padding: 16px; font-family: sans-serif; }
                        h2 { font-size: 18px; margin-top: 20px; }
                        ul { padding-left: 20px; }
                        li { margin-bottom: 8px; }
                      </style>
                    </head>
                    <body>
                      <h2>Vocal Expertise:</h2>
                      <ul>
                        <li>Classically trained soprano with a 3-octave range</li>
                        <li>Proficient in jazz, pop, and classical vocal styles</li>
                      </ul>
                      <h2>Piano Skills:</h2>
                      <ul>
                        <li>Advanced piano performance capabilities</li>
                        <li>Sight-reading and improvisation expertise</li>
                      </ul>
                    </body>
                  </html>
                `,
              }}
              javaScriptEnabled
              domStorageEnabled
            />
          </View> */}
        </View>
      </ScrollView>

      {/* Calendar Modal */}
      <CalendarModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        availabilityDates={availabilityDates}
        nextAvailableDate={nextAvailableDate}
        currentDate={currentDate}
      />

      {/* Bottom Action Buttons */}
      <View className="flex-row p-4 border-t border-gray-200 bg-white items-center">
        <View className="flex-1">
          <ActionButtons
            onCancel={handleSendMessage}
            onPrimaryAction={handleHire}
            cancelText="Send Message"
            primaryText="Hire"
            containerStyle="flex-row space-x-2 min-h-[44px]"
            cancelButtonStyle="border border-gray-300 rounded-lg py-3 px-4 flex-1 items-center justify-center min-w-[120px]"
            primaryButtonStyle="bg-red-500 rounded-lg py-3 px-4 flex-1 items-center justify-center min-w-[120px]"
            cancelTextStyle="text-gray-700 font-medium text-sm whitespace-nowrap"
            primaryTextStyle="text-white font-medium text-sm whitespace-nowrap"
          />
        </View>
        <TouchableOpacity
          onPress={toggleFavorite}
          className="ml-2 border border-gray-300 rounded-lg p-3"
        >
          <Assets.icons.heart
            width={24}
            height={24}
            stroke={isFavorite ? "red" : "#9CA3AF"}
            strokeWidth="1.5"
            fill={isFavorite ? "red" : "none"}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfilePage;