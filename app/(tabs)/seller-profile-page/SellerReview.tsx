import Assets from "@/assets";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";

type WorkHistoryItem = {
  location: string;
  rating: number;
  date: string;
  services: string;
  text: string;
};

type ReviewProps = {
  workHistory: WorkHistoryItem[];
};

const SellerReview: React.FC = () => {
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>([]);

  useEffect(() => {
    //Below is the dummy data
    const dummyData: WorkHistoryItem[] = [
      {
        location: "San Francisco, CA",
        rating: 5.0,
        date: "15 Aug, 2025",
        services: "Singing, Hosting",
        text: "Great performance, very professional! Arrived on time and kept the crowd entertained throughout the night.",
      },
      {
        location: "San Francisco, CA",
        rating: 4.5,
        date: "10 Aug, 2025",
        services: "Singing",
        text: "Good voice, but came slightly late. Once started, the performance was soulful and the audience loved it.",
      },
      {
        location: "New York, NY",
        rating: 4.8,
        date: "05 Aug, 2025",
        services: "Singing, DJ",
        text: "Fantastic energy on stage! The mix of live singing and DJ skills made the event unforgettable. Highly recommended.",
      },
    ];

    setWorkHistory(dummyData);

    // 🔻 Uncomment this when API is ready
    /*
    const fetchReviews = async () => {
      try {
        const response = await fetch("https://your-api-url.com/reviews");
        const data = await response.json();
        setWorkHistory(data); // ensure API returns WorkHistoryItem[]
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
    */
  }, []);

  return (
    <View className="mt-6">
      <Text className="font-bold text-xl mb-3">Work History</Text>
      {workHistory.map((review, index: number) => (
        <View key={index} className="mb-4 pb-4 border-b border-gray-200">
          <View className="flex-row justify-between items-start">
            <Text className="text-lg text-gray-900 font-semibold underline-gray-900">
            {review.location}
            </Text>

            <View className="flex-row items-center">
              <Assets.icons.star width={18} height={18} fill="#FFD700" />
              <Assets.icons.star width={18} height={18} fill="#FFD700" />
              <Assets.icons.star width={18} height={18} fill="#FFD700" />
              <Assets.icons.star width={18} height={18} fill="#FFD700" />
              <Assets.icons.star width={18} height={18} fill="#FFD700" />

              <Text className="text-sm font-medium">{review.rating}</Text>
            </View>
          </View>
          <Text className="text-base text-gray-500 mb-2">{review.date}</Text>
          <View className="mb-3">
            <Text className="text-lg text-gray-700 mb-2 font-semibold">
              Services:
            </Text>
            <View className="flex-row flex-wrap">
              {review.services
                .split(", ")
                .map((service: string, serviceIndex: number) => (
                  <View
                    key={serviceIndex}
                    className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-0"
                  >
                    <Text className="text-base text-gray-700 p-1 font-normal">
                      {service}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
          <Text className="text-base text-gray-700 leading-relaxed">
            "{review.text}"
          </Text>
        </View>
      ))}
    </View>
  );
};

export default SellerReview;
