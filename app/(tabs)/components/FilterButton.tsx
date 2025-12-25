import Assets from "@/assets";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import api from "../../../api/axiosInstance";
interface FilterButtonProps {
  onApplyFilters: (filters: any) => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ onApplyFilters }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [priceRange, setPriceRange] = useState<string[]>([]);
  const [genderOptions, setGenderOptions] = useState<string[]>([]);
  const [sellerTiers, setSellerTiers] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [date, setDate] = useState<Date>(new Date()); // Initialize with valid Date
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [genresModalVisible, setGenresModalVisible] = useState(false);
  const [rangeModalVisible, setRangeModalVisible] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [zipCode, setZipCode] = useState("");

  const [categoryData, setCategoryData] = useState<
    { section: string; items: string[] }[]
  >([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get(
          "api/sellers/categories/categories"
        );
        if (response.data.success) {
          const formattedData = response.data.data.map((category: any) => ({
            section: category.name,
            items: category.subcategories.map((sub: any) => sub.name),
          }));
          setCategoryData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to empty data
        setCategoryData([]);
        //         setCategoryData([
        //   { section: "String", items: ["Harmonium", "Guitarist"] },
        //   { section: "Wind", items: ["Flute", "Trumpet", "Singer"] },
        //   { section: "Percussion", items: ["Drums", "Tambourine"] },
        // ]);
      }
    };
    fetchCategories();
  }, []);

  // const categoryData = [
  //   {
  //     section: "String",
  //     items: ["Harmonium", "Accordion", "Harmonica"],
  //   },
  //   {
  //     section: "Electronic",
  //     items: ["Synthesizer"],
  //   },
  //   {
  //     section: "Wind",
  //     items: [
  //       "Brass/Wind Instruments",
  //       "Flute",
  //       "Trumpet",
  //       "Saxophone",
  //       "Trombone",
  //       "French horn",
  //     ],
  //   },
  // ];

  const priceRangeOptions = [
    "Less than $100",
    "$100 to $500",
    "$500 to $1K",
    "$1K to $5K",
    "$5K+",
  ];

  const genderList = ["Male", "Female", "Other"];

  const sellerTiersList = [
    "New",
    "Rising Talent",
    "Top Rated",
    "Top Rated Plus",
  ];

  const languageOptions = [
    "English",
    "French",
    "Spanish",
    "Hindi",
    "Urdu",
    // "Japanese",
    // "Hindi",
    // "Arabic",
    // "Portuguese",
    // "Russian",
    // "Korean",
    // "Italian",
    // "Dutch",
    // "Turkish",
    // "Polish",
    // "Swedish",
  ];

  const genresOptions = [
    "Jazz",
    "Country",
    "Gospel",
    "Christian",
    "RnB",
    "R&B",
    "Pop",
    "Blues",
    "Funk",
  ];

  const rangeOptions = [
    "within 50 miles",
    "within 100 miles",
    "within 150 miles",
    "within 250 miles",
    "within 500 miles",
    "within 1000 miles",
  ];

  const formatDate = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const togglePriceRange = (range: string) => {
    setPriceRange((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const toggleGender = (option: string) => {
    setGenderOptions((prev) =>
      prev.includes(option)
        ? prev.filter((g) => g !== option)
        : [...prev, option]
    );
  };

  const toggleSellerTier = (tier: string) => {
    setSellerTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
  };

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const selectRange = (range: string) => {
    setSelectedRange(range);
    setRangeModalVisible(false);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false); // Hide picker for both iOS and Android
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // //This is to send the data to the backend
  // const applyFilters = async () => {
  //   try {
  //     const filters: any = {
  //       category:
  //         selectedCategories.length > 0
  //           ? selectedCategories[0].toLowerCase().replace(/\s+/g, "-")
  //           : undefined,
  //       search: selectedCategories.join(",") || undefined,
  //     };

  //     Object.keys(filters).forEach(
  //       (key) => filters[key] === undefined && delete filters[key]
  //     );

  //     const response = await axios.get(
  //       "http://192.168.29.179:5000/api/Sellers",
  //       {
  //         params: filters,
  //       }
  //     );

  //     console.log("Filtered sellers:", response.data);
  //     toggleModal();
  //   } catch (error) {
  //     console.error("Error applying filters:", error);
  //     alert("Failed to apply filters. Please try again.");
  //   }
  // };

  const applyFilters = () => {
    const filters = {
      category:
        selectedCategories.length > 0
          ? selectedCategories[0].toLowerCase().replace(/\s+/g, "-")
          : undefined,
      subcategories:
        selectedCategories.length > 0
          ? selectedCategories.join(",")
          : undefined,
      price_range: priceRange.length > 0 ? priceRange.join(",") : undefined,
      genres: selectedGenres.length > 0 ? selectedGenres.join(",") : undefined,
      languages: languages.length > 0 ? languages.join(",") : undefined,
      gender: genderOptions.length > 0 ? genderOptions.join(",") : undefined,
      badge: sellerTiers.length > 0 ? sellerTiers.join(",") : undefined,
      availability_date: formatDate(date),
      zip_code: zipCode || undefined,
      range: selectedRange
        ? parseInt(selectedRange.match(/\d+/)?.[0] || "0")
        : undefined,
    };

    Object.keys(filters).forEach((key) => {
      const typedKey = key as keyof typeof filters;
      if (filters[typedKey] === undefined) {
        delete filters[typedKey];
      }
    });

    onApplyFilters(filters);
    toggleModal();
  };

  return (
    <>
      <TouchableOpacity
        className="bg-black rounded-lg p-3 ml-2"
        onPress={toggleModal}
      >
        <Assets.icons.filter
          width={24}
          height={24}
          stroke="white"
          strokeWidth="1.5"
          fill="none"
        />
      </TouchableOpacity>

      {/* Main Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <TouchableWithoutFeedback onPress={toggleModal}>
          <View className="flex-1 bg-black/50 justify-end">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-t-3xl max-h-[80%]">
                <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
                  <Text className="text-xl font-bold text-black">
                    Filter By
                  </Text>
                  <TouchableOpacity onPress={toggleModal}>
                    <Text className="text-2xl">×</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView className="p-5">
                  <View className="flex-row mb-5">
                    <View className="flex-1 mr-2">
                      <Text className="text-base font-medium text-black mb-2">
                        Zip Code
                      </Text>
                      <TextInput
                        placeholder="Ex. 46553"
                        className="border border-gray-300 rounded-lg p-2"
                        value={zipCode}
                        onChangeText={setZipCode}
                      />
                    </View>

                    <View className="flex-1 ml-2">
                      <Text className="text-base font-medium text-black mb-2">
                        Range
                      </Text>
                      <TouchableOpacity
                        className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
                        onPress={() => setRangeModalVisible(true)}
                      >
                        <Text className="text-gray-500">
                          {selectedRange || "Select Range"}
                        </Text>
                        <Text className="text-gray-500">▼</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="mb-5">
                    <Text className="text-base font-medium text-black mb-2">
                      Category
                    </Text>
                    <TouchableOpacity
                      className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
                      onPress={() => setCategoryModalVisible(true)}
                    >
                      <Text className="text-gray-500">
                        {selectedCategories.length > 0
                          ? `${selectedCategories.length} selected`
                          : "Select Category"}
                      </Text>
                      <Text className="text-gray-500">▼</Text>
                    </TouchableOpacity>
                  </View>

                  <View className="mb-5">
                    <Text className="text-base font-medium text-black mb-2">
                      Genres
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
                      <Text className="text-gray-500">▼</Text>
                    </TouchableOpacity>
                  </View>

                  <View className="mb-5">
                    <Text className="text-base font-medium text-black mb-2">
                      Price Range
                    </Text>
                    <View>
                      {priceRangeOptions.map((range, index) => (
                        <TouchableOpacity
                          key={index}
                          className="py-3 flex-row items-center"
                          onPress={() => togglePriceRange(range)}
                        >
                          <View
                            className={`w-5 h-5 border border-gray-300 rounded mr-3 justify-center items-center ${
                              priceRange.includes(range) ? "bg-red-500" : ""
                            }`}
                          >
                            {priceRange.includes(range) && (
                              <Assets.icons.checkmark
                                height={12}
                                width={12}
                                fill="#ff0000"
                                stroke="#ff0000"
                              />
                            )}
                          </View>
                          <Text
                            className={`text-base ${
                              priceRange.includes(range)
                                ? "text-red-500 font-medium"
                                : "text-gray-800"
                            }`}
                          >
                            {range}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View className="mb-5">
                    <Text className="text-base font-medium text-black mb-2">
                      Date
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(true)}
                      className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
                    >
                      <Text className="text-base text-gray-800">
                        {formatDate(date)}
                      </Text>
                      <Assets.icons.calendar
                        width={24}
                        height={24}
                        stroke="#9CA3AF"
                        strokeWidth="1.5"
                        fill="none"
                      />
                    </TouchableOpacity>

                    {showDatePicker && (
                      <DateTimePicker
                        value={date}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={onDateChange}
                      />
                    )}
                  </View>

                  <View className="mb-5">
                    <Text className="text-base font-medium text-black mb-2">
                      Language
                    </Text>
                    <TouchableOpacity
                      className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
                      onPress={() => setLanguageModalVisible(true)}
                    >
                      <Text className="text-gray-500">
                        {languages.length > 0
                          ? `${languages.length} selected`
                          : "Select Language"}
                      </Text>
                      <Text className="text-gray-500">▼</Text>
                    </TouchableOpacity>
                  </View>

                  <View className="mb-5">
                    <Text className="text-base font-medium text-black mb-2">
                      Gender
                    </Text>
                    <View>
                      {genderList.map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          className="py-3 flex-row items-center"
                          onPress={() => toggleGender(option)}
                        >
                          <View
                            className={`w-5 h-5 border border-gray-300 rounded mr-3 justify-center items-center ${
                              genderOptions.includes(option) ? "bg-red-500" : ""
                            }`}
                          >
                            {genderOptions.includes(option) && (
                              <Assets.icons.checkmark
                                height={12}
                                width={12}
                                fill="#ff0000"
                                stroke="#ff0000"
                              />
                            )}
                          </View>
                          <Text
                            className={`text-base ${
                              genderOptions.includes(option)
                                ? "text-red-500 font-medium"
                                : "text-gray-800"
                            }`}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View className="mb-5">
                    <Text className="text-base font-medium text-black mb-2">
                      Seller Tiers
                    </Text>
                    <View>
                      {sellerTiersList.map((tier, index) => (
                        <TouchableOpacity
                          key={index}
                          className="py-3 flex-row items-center"
                          onPress={() => toggleSellerTier(tier)}
                        >
                          <View
                            className={`w-5 h-5 border border-gray-300 rounded mr-3 justify-center items-center ${
                              sellerTiers.includes(tier) ? "bg-red-500" : ""
                            }`}
                          >
                            {sellerTiers.includes(tier) && (
                              <Assets.icons.checkmark
                                height={12}
                                width={12}
                                fill="#ff0000"
                                stroke="#ff0000"
                              />
                            )}
                          </View>
                          <Text
                            className={`text-base ${
                              sellerTiers.includes(tier)
                                ? "text-red-500 font-medium"
                                : "text-gray-800"
                            }`}
                          >
                            {tier}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </ScrollView>

                <View className="flex-row p-5 border-t border-gray-200">
                  <TouchableOpacity
                    className="flex-1 border border-gray-300 rounded-lg py-3 mr-2"
                    onPress={toggleModal}
                  >
                    <Text className="text-black text-center font-medium">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  {/* <TouchableOpacity
                    className="flex-1 bg-red-500 rounded-lg py-3 ml-2"
                    onPress={toggleModal}
                  > */}
                  <TouchableOpacity
                    className="flex-1 bg-red-500 rounded-lg py-3 ml-2"
                    onPress={applyFilters}
                  >
                    <Text className="text-white text-center font-medium">
                      Apply Filter
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setLanguageModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-t-3xl max-h-[80%]">
                <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
                  <Text className="text-xl font-bold text-black">
                    Select Language
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
                          languages.includes(lang) ? "bg-red-500" : ""
                        }`}
                      >
                        {languages.includes(lang) && (
                          <Assets.icons.checkmark
                            height={12}
                            width={12}
                            fill="#ff0000"
                            stroke="#ff0000"
                          />
                        )}
                      </View>
                      <Text
                        className={`text-base ${
                          languages.includes(lang)
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

      {/* Category Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={categoryModalVisible}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setCategoryModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-t-3xl max-h-[80%]">
                <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
                  <Text className="text-xl font-bold text-black">
                    Select Category
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
                              selectedCategories.includes(item)
                                ? "bg-red-500 border-red-500"
                                : ""
                            }`}
                          >
                            {selectedCategories.includes(item) && (
                              <Assets.icons.checkmark
                                height={12}
                                width={12}
                                fill="#ff0000"
                                stroke="#ff0000"
                              />
                            )}
                          </View>
                          <Text
                            className={`text-base ${
                              selectedCategories.includes(item)
                                ? "text-red-500 font-medium"
                                : "text-gray-800"
                            }`}
                          >
                            {item}
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

      {/* Genres Selection Modal */}
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
                  <TouchableOpacity
                    onPress={() => setGenresModalVisible(false)}
                  >
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
                          <Assets.icons.checkmark
                            height={12}
                            width={12}
                            fill="#ff0000"
                            stroke="#ff0000"
                          />
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

      {/* Range Selection Modal */}
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
    </>
  );
};

export default FilterButton;