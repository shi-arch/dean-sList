import Assets from "@/assets";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../../../api/axiosInstance";
import "../../global.css";
import BrowseByCategory from "../components/BrowseByCategory";
import HeaderSection from "../components/HeaderSection";
import MainHeader from "../components/MainHeader";
import ProfileCompletion from "../components/ProfileCompletion";
import SearchFilterSection from "../components/SearchFilterSection";
import TalentCard from "./TalentCard";
import env from "../../config/index";
import { useAuth } from "../../../context/AuthContext";

import { useLocalSearchParams } from "expo-router"; //For saved Talent

// Define Talent interface for type safety
interface Talent {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  price: string;
  description: string;
  image: string;
  tags: string[];
  hasStatus: boolean;
  badge: string;
  badgeColor: string;
  buttonText: string;
  buttonColor: string;
  stories: any[];
  services: number[];
  isFavorite: boolean; // Add isFavorite to Talent interface
}

// Define Pagination interface
interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Get dynamic API URL from config
const getApiUrl = () => env?.APP_API_URL || 'http://192.168.29.179:5000';
const getDefaultImageUrl = () => `${getApiUrl()}/stories/profile1.png`;

const MainContentSection: React.FC = () => {
  const { showSavedTalent } = useLocalSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (showSavedTalent === "true") {
      handleSavedTalent();
    }
  }, [showSavedTalent]);
  // State for search query
  const [searchQuery, setSearchQuery] = useState("");
  // State for view modes
  const [isSearching, setIsSearching] = useState(false);
  const [isBrowseBtnTalent, setBrowseBtnTalent] = useState(false);
  const [isSavedTalent, setSavedTalent] = useState(false);
  // Current category for filtering
  const [currentCategory, setCurrentCategory] = useState("");
  // Sellers data for search/browse/saved views
  const [sellers, setSellers] = useState<Talent[]>([]);
  //This state is used to store the filtered sellers
  const [filters, setFilters] = useState<any>({});
  // Home page data
  const [homeData, setHomeData] = useState<{
    risingTalents: Talent[];
    topRatedTalents: Talent[];
    browseTalents: Talent[];
  }>({
    risingTalents: [],
    topRatedTalents: [],
    browseTalents: [],
  });
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  // Error state
  const [error, setError] = useState<string | null>(null);
  // Favorite talent IDs
  const [favorites, setFavorites] = useState<string[]>([]);
  // Pagination state
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  // Fetch initial favorites on mount (only if authenticated)
  useEffect(() => {
    // Don't fetch if auth is still loading or user is not authenticated
    if (authLoading || !isAuthenticated) {
      return;
    }

    const fetchInitialFavorites = async () => {
      try {
        const response = await api.get("/api/sellers/saved");
        if (response.data.success) {
          setFavorites(response.data.data.map((talent: Talent) => talent.id));
        }
      } catch (err: any) {
        // Don't log or retry on 401 errors - user is not authenticated
        if (err.response?.status === 401) {
          console.log("User not authenticated, skipping favorites fetch");
          return;
        }
        // Network errors are expected if backend is not running - don't spam console
        if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          console.log("Network error - backend may not be running");
          return;
        }
        console.error("Fetch initial favorites error:", err);
        console.error(
          "Fetch initial favorites error:",
          err.response?.data || err.message
        );
      }
    };
    fetchInitialFavorites();
  }, [isAuthenticated, authLoading]);

  // Fetch sellers with pagination or home data
  const fetchSellers = async (
    page: number = 1,
    search: string = "",
    category: string = "",
    section: string = "",
    filters: any = {}
  ) => {
    try {
      if (page === 1) setLoading(true);
      else if (section !== "home") setLoadingMore(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: section === "home" ? "" : "10",
      });

      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (section) params.append("section", section);
      if (filters.subcategories)
        params.append("subcategories", filters.subcategories);
      if (filters.price_range)
        params.append("price_range", filters.price_range);
      if (filters.genres) params.append("genres", filters.genres);
      if (filters.languages) params.append("languages", filters.languages);
      if (filters.gender) params.append("gender", filters.gender);
      if (filters.badge) params.append("badge", filters.badge);
      if (filters.availability_date)
        params.append("availability_date", filters.availability_date);
      if (filters.zip_code) params.append("zip_code", filters.zip_code);
      if (filters.range) params.append("range", filters.range.toString());

      // const response = await fetch(`${API_BASE_URL}?${params}`);
      // if (!response.ok) {
      //   throw new Error(`HTTP error! Status: ${response.status}`);
      // }
      const response = await api.get(`/api/sellers?${params}`); // Use axios instance
      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to fetch sellers");
      }

      // const data = await response.json();
      const data = response.data;

      if (data.success) {
        if (section === "home") {
          setHomeData({
            risingTalents:
              data.data.risingTalents?.map((item: any) => ({
                ...item,
                id: item.id?.toString() || `fallback-${Math.random()}`,
                image:
                  item.image ||
                  getDefaultImageUrl(),
                isFavorite: item.isFavorite || false, // Add this
              })) || [],
            topRatedTalents:
              data.data.topRatedTalents?.map((item: any) => ({
                ...item,
                id: item.id?.toString() || `fallback-${Math.random()}`,
                image:
                  item.image ||
                  getDefaultImageUrl(),
                isFavorite: item.isFavorite || false, // Add this
              })) || [],
            browseTalents:
              data.data.browseTalents?.map((item: any) => ({
                ...item,
                id: item.id?.toString() || `fallback-${Math.random()}`,
                image:
                  item.image ||
                  getDefaultImageUrl(),
                isFavorite: item.isFavorite || false, // Add this
              })) || [],
          });
        } else {
          setSellers(
            data.data.map((item: any) => ({
              ...item,
              id: item.id?.toString() || `fallback-${Math.random()}`,
              image:
                item.image || getDefaultImageUrl(),
              isFavorite: item.isFavorite || false, // Add this
            }))
          );
          setPagination(
            data.pagination || {
              currentPage: page,
              totalPages: 1,
              totalItems: 0,
              itemsPerPage: 10,
              hasNextPage: false,
              hasPrevPage: false,
            }
          );
        }
      } else {
        setError(data.error || "Failed to fetch sellers");
      }
    } catch (err: any) {
      // Don't set error or retry on 401 errors - user is not authenticated
      if (err.response?.status === 401) {
        console.log("User not authenticated, skipping sellers fetch");
        setLoading(false);
        setLoadingMore(false);
        return;
      }
      setError(err.message || "Network error. Please check your connection.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchSavedTalents = async (page: number = 1) => {
  try {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);
    const response = await api.get(`/api/sellers/saved?page=${page}&limit=10`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch saved talents');
    }
    setSellers(
      response.data.data.map((item: any) => ({
        ...item,
        id: item.id?.toString() || `fallback-${Math.random()}`,
        image: item.image || getDefaultImageUrl(),
        isFavorite: true,
      }))
    );
    setPagination(
      response.data.pagination || {
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
      }
    );
  } catch (err: any) {
    // Don't log or retry on 401 errors - user is not authenticated
    if (err.response?.status === 401) {
      console.log("User not authenticated, skipping saved talents fetch");
      setLoading(false);
      setLoadingMore(false);
      return;
    }
    console.error('Fetch saved talents error:', err.response?.data || err.message);
    setError(err.message || 'Network error. Please check your connection.');
  } finally {
    setLoading(false);
    setLoadingMore(false);
  }
};

  // Initial fetch for home page data (only if authenticated)
  useEffect(() => {
    // Don't fetch if auth is still loading or user is not authenticated
    if (authLoading || !isAuthenticated) {
      return;
    }
    fetchSellers(1, "", "", "home");
  }, [isAuthenticated, authLoading]);

  // Handle search with debouncing
  // useEffect(() => {
  //   const isSearchActive = searchQuery.trim() !== "";
  //   if (isSearchActive && !currentCategory) {
  //     setIsSearching(true);
  //     const timeoutId = setTimeout(() => {
  //       fetchSellers(1, searchQuery, "");
  //     }, 500);
  //     return () => clearTimeout(timeoutId);
  //   } else if (
  //     !isSearchActive &&
  //     !currentCategory &&
  //     !isBrowseBtnTalent &&
  //     !isSavedTalent
  //   ) {
  //     setIsSearching(false);
  //     setSellers([]); // Clear sellers when search is cleared
  //     fetchSellers(1, "", "", "home"); // Reload home data
  //   }
  // }, [searchQuery, currentCategory]);




  // New change to handle 


  useEffect(() => {
  const isSearchActive = searchQuery.trim() !== "";
  if (isSearchActive && !currentCategory) {
    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      fetchSellers(1, searchQuery, "");
    }, 500);
    return () => clearTimeout(timeoutId);
  }
}, [searchQuery, currentCategory]);

  // // Get filtered data for search/browse/saved views
  // const getFilteredData = (): Talent[] => {
  //   if (isSavedTalent) {
  //     return sellers.filter((talent) => favorites.includes(talent.id));
  //   }
  //   return sellers;
  // };

  // Get filtered data for search/browse/saved views
  const getFilteredData = (): Talent[] => {
    if (isSavedTalent) {
      return sellers; // Already filtered by fetchSavedTalents
    }
    return sellers;
  };

  // // Handle next page navigation
  // const handleNextPage = () => {
  //   if (pagination.hasNextPage && !loadingMore) {
  //     const nextPage = pagination.currentPage + 1;
  //     if (isSearching) {
  //       fetchSellers(nextPage, searchQuery, '','', filters);
  //     } else if (isBrowseBtnTalent) {
  //       fetchSellers(nextPage, '', currentCategory,'', filters);
  //     }
  //   }
  // };

  // Handle next page navigation
  const handleNextPage = () => {
    if (pagination.hasNextPage && !loadingMore) {
      const nextPage = pagination.currentPage + 1;
      if (isSearching) {
        fetchSellers(nextPage, searchQuery, "", "", filters);
      } else if (isBrowseBtnTalent) {
        fetchSellers(nextPage, "", currentCategory, "", filters);
      } else if (isSavedTalent) {
        fetchSavedTalents(nextPage);
      }
    }
  };



  // Handle previous page navigation
  const handlePrevPage = () => {
    if (pagination.hasPrevPage && !loadingMore) {
      const prevPage = pagination.currentPage - 1;
      if (isSearching) {
        fetchSellers(prevPage, searchQuery, "", "", filters);
      } else if (isBrowseBtnTalent) {
        fetchSellers(prevPage, "", currentCategory, "", filters);
      } else if (isSavedTalent) {
        fetchSavedTalents(prevPage);
      }
    }
  };

  // Toggle favorite status
  // const toggleFavorite = (id: string) => {
  //   setFavorites((prev) =>
  //     prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
  //   );
  // };

  // Toggle favorite status
  // const toggleFavorite = async (id: string) => {
  //   try {
  //     const response = await api.post(`/api/Sellers/${id}/favorite`);
  //     if (response.data.success) {
  //       setFavorites((prev) =>
  //         response.data.isFavorited
  //           ? [...prev, id]
  //           : prev.filter((itemId) => itemId !== id)
  //       );
  //     } else {
  //       throw new Error(response.data.message || 'Failed to toggle favorite');
  //     }
  //   } catch (err: any) {
  //     setError(err.message || 'Failed to toggle favorite');
  //   }
  // };

  const toggleFavorite = async (id: string) => {
    try {
      console.log("Toggling favorite for ID:", id); // Debug
      const response = await api.post(`/api/sellers/${id}/favorite`);
      console.log("Toggle favorite response:", response.data); // Debug
      if (response.data.success) {
        setFavorites((prev) => {
          const newFavorites = response.data.isFavorited
            ? [...prev, id]
            : prev.filter((itemId) => itemId !== id);
          console.log("Updated favorites:", newFavorites); // Debug
          return newFavorites;
        });
        // also update sellers list when in saved view
        if (isSavedTalent) {
          setSellers((prev) =>
            prev.filter((item) =>
              response.data.isFavorited ? true : item.id !== id
            )
          );
        } else {
          setSellers((prev) =>
            prev.map((item) =>
              item.id === id
                ? { ...item, isFavorite: response.data.isFavorited }
                : item
            )
          );
        }
      } else {
        throw new Error(response.data.message || "Failed to toggle favorite");
      }
    } catch (err: any) {
      console.error(
        "Toggle favorite error:",
        err.response?.data || err.message
      );
      setError(err.message || "Failed to toggle favorite");
    }
  };

  // Handle search query change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentCategory("");
    setBrowseBtnTalent(false);
    setSavedTalent(false);
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setCurrentCategory(category);
    setSearchQuery("");
    setIsSearching(false);
    setBrowseBtnTalent(true);
    setSavedTalent(false);
    // fetchSellers(1, '', category);
    fetchSellers(1, "", category, "", filters);
  };

  // Handle browse all talents
  const handleBrowseAll = () => {
    setBrowseBtnTalent(true);
    setIsSearching(false);
    setSavedTalent(false);
    setCurrentCategory("");
    setSearchQuery("");
    // fetchSellers(1, '', '');
    fetchSellers(1, "", "", "", filters);
  };

// Update handleSavedTalent to use the paginated fetchSavedTalents
const handleSavedTalent = () => {
  setSavedTalent(true);
  setIsSearching(false);
  setBrowseBtnTalent(false);
  setCurrentCategory('');
  setSearchQuery('');
  fetchSavedTalents(1); // Start with page 1
};
  //Handle filter pply
  const handleApplyFilters = (newFilters: any) => {
    console.log(newFilters);
    setFilters(newFilters);
    // setIsSearching(true);
    setIsSearching(false);
    // setBrowseBtnTalent(false);
    setBrowseBtnTalent(true);
    setSavedTalent(false);
    setCurrentCategory(newFilters.category || "");
    // setSearchQuery(newFilters.subcategories || "");
    fetchSellers(
      1,
      "",
      // newFilters.subcategories || "",
      newFilters.category || "",
      "",
      newFilters
    );
  };

  // Get display title for header
  const getDisplayTitle = () => {
    if (isSearching) return "Search Results";
    if (isSavedTalent) return "Saved Talent";
    if (isBrowseBtnTalent && currentCategory) {
      return `${
        currentCategory.charAt(0).toUpperCase() +
        currentCategory.slice(1).replace("-", " ")
      } Talent`;
    }
    if (isBrowseBtnTalent) return "Browse Talent";
    return "Browse Talent";
  };

  // Loading state for initial load or home data
  if (loading && !isSearching && !isBrowseBtnTalent && !isSavedTalent) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="text-gray-500 mt-2">Loading...</Text>
      </View>
    );
  }

  // // Error state
  // if (error && !sellers.length && !homeData.risingTalents.length) {
  //   return (
  //     <View className="flex-1 items-center justify-center py-8">
  //       <Text className="text-red-500">{error}</Text>
  //       <TouchableOpacity
  //         className="mt-4 bg-blue-500 rounded-lg px-4 py-2"
  //         onPress={() => {
  //           setError(null);
  //           if (isSearching) {
  //             fetchSellers(1, searchQuery, '');
  //           } else if (isBrowseBtnTalent) {
  //             fetchSellers(1, '', currentCategory);
  //           } else {
  //             fetchSellers(1, '', '', 'home');
  //           }
  //         }}
  //       >
  //         <Text className="text-white text-center font-medium">Retry</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // }

  // Error state
  if (error && !sellers.length && !homeData.risingTalents.length) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <Text className="text-red-500">{error}</Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 rounded-lg px-4 py-2"
          onPress={() => {
            setError(null);
            if (isSearching) {
              fetchSellers(1, searchQuery, "", "", filters);
            } else if (isBrowseBtnTalent) {
              fetchSellers(1, "", currentCategory, "", filters);
            } else if (isSavedTalent) {
              fetchSavedTalents(1);
            } else {
              fetchSellers(1, "", "", "home");
            }
          }}
        >
          <Text className="text-white text-center font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header: Conditional rendering based on view mode */}
      {isSearching || isBrowseBtnTalent || isSavedTalent ? (
        <MainHeader title={getDisplayTitle()} showNotification={true} />
      ) : (
        <HeaderSection />
      )}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 0 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile completion banner for home view */}
        {!(isSearching || isBrowseBtnTalent || isSavedTalent) && (
          <ProfileCompletion />
        )}

        {/* Search bar */}
        {/* {!SavedTalent && (
          <SearchFilterSection
            onSearchChange={handleSearchChange}
            isSearching={isSearching}
            searchQuery={searchQuery}
            onApplyFilters={handleApplyFilters}
          />
        )} */}

        {/* Search bar - Hidden when isSavedTalent is true */}
  {!isSavedTalent && (
    <SearchFilterSection
      onSearchChange={handleSearchChange}
      isSearching={isSearching}
      searchQuery={searchQuery}
      onApplyFilters={handleApplyFilters}
    />
  )}

  {isSearching && searchQuery.length > 0 || searchQuery.length > 0 || isBrowseBtnTalent || isSavedTalent ? (
    <>
      {/* Saved Talent button for search/browse views - Hidden when isSavedTalent is true */}
      {(isSearching || isBrowseBtnTalent) && !isSavedTalent && (
        <View className="flex-row justify-end mb-4">
          <TouchableOpacity
            className="rounded-lg px-0 py-0"
            onPress={handleSavedTalent}
          >
            <Text className="text-black text-sm font-medium">
              Saved Talent
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Render talent cards */}
      {getFilteredData().map((talent) => (
        <TalentCard
          key={talent.id}
          talent={talent}
          showButtons={true}
          onFavoriteToggle={toggleFavorite}
          isFavorite={favorites.includes(talent.id) || talent.isFavorite}
        />
      ))}

      {/* Loading more indicator */}
      {loadingMore && (
        <View className="items-center justify-center py-4">
          <ActivityIndicator size="small" color="#0000ff" />
          <Text className="text-gray-500 mt-2">Loading...</Text>
        </View>
      )}

      {/* No results message */}
      {!loading && !loadingMore && getFilteredData().length === 0 && (
        <View className="items-center justify-center py-8">
          <Text className="text-gray-500">
            {isSearching 
              ? `No results found for "${searchQuery}"`
              : isSavedTalent
              ? "No saved talents yet."
              : currentCategory
              ? `No ${currentCategory.replace("-", " ")} talent found.`
              : "No talent found."}
          </Text>
        </View>
      )}

      {/* Pagination controls */}
      {pagination.totalPages > 1 && (
        <View className="flex-row justify-between items-center px-4 py-2 mb-4 mt-4">
          <TouchableOpacity
            onPress={handlePrevPage}
            disabled={!pagination.hasPrevPage || loadingMore}
          >
            <View
              style={{
                padding: 8,
                borderWidth: 1,
                borderColor:
                  pagination.hasPrevPage && !loadingMore
                    ? "#E5E7EB"
                    : "#F3F4F6",
                borderRadius: 4,
                opacity: pagination.hasPrevPage && !loadingMore ? 1 : 0.5,
              }}
            >
              <Assets.icons.leftArrow
                width={16}
                height={16}
                stroke={
                  pagination.hasPrevPage && !loadingMore
                    ? "#9CA3AF"
                    : "#D1D5DB"
                }
              />
            </View>
          </TouchableOpacity>
          <Text className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </Text>
          <TouchableOpacity
            onPress={handleNextPage}
            disabled={!pagination.hasNextPage || loadingMore}
          >
            <View
              style={{
                padding: 8,
                borderWidth: 1,
                borderColor:
                  pagination.hasNextPage && !loadingMore
                    ? "#E5E7EB"
                    : "#F3F4F6",
                borderRadius: 4,
                opacity: pagination.hasNextPage && !loadingMore ? 1 : 0.5,
              }}
            >
              <Assets.icons.rightArrow
                width={16}
                height={16}
                stroke={
                  pagination.hasNextPage && !loadingMore
                    ? "#9CA3AF"
                    : "#D1D5DB"
                }
              />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Results count */}
      {pagination.totalItems > 0 && (
        <View className="items-center mb-4">
          <Text className="text-xs text-gray-500">
            Showing{" "}
            {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
            to{" "}
            {Math.min(
              pagination.currentPage * pagination.itemsPerPage,
              pagination.totalItems
            )}{" "}
            of {pagination.totalItems} results
          </Text>
        </View>
      )}
    </>
  ): isSearching && searchQuery.length === 0 ? (
  //  show blank state or hint
  <Text className="text-gray-400 p-4">Start typing to search</Text>
) : (  
          <View className="mb-6">
            {/* Rising Talent section */}
            <Text className="text-lg font-bold text-black mb-3">
              Rising Talent
            </Text>
            {homeData.risingTalents.length === 0 && !loading ? (
              <Text className="text-gray-500 mb-3">
                No Rising Talents available
              </Text>
            ) : (
              <FlatList
                data={homeData.risingTalents}
                renderItem={({ item }) => (
                  <TalentCard
                    talent={item}
                    showButtons={false}
                    isHorizontal={true}
                    onFavoriteToggle={toggleFavorite}
                    isFavorite={favorites.includes(item.id) || item.isFavorite}
                  />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
              />
            )}
            {/* Top Rated section */}
            <Text className="text-lg font-bold text-black mb-3 mt-4">
              Top Rated
            </Text>
            {homeData.topRatedTalents.length === 0 && !loading ? (
              <Text className="text-gray-500 mb-3">
                No Top Rated Talents available
              </Text>
            ) : (
              <FlatList
                data={homeData.topRatedTalents}
                renderItem={({ item }) => (
                  <TalentCard
                    talent={item}
                    showButtons={false}
                    isHorizontal={true}
                    onFavoriteToggle={toggleFavorite}
                    isFavorite={favorites.includes(item.id) || item.isFavorite}
                  />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
              />
            )}
            {/* Browse Talent section */}
            <View className="mt-6">
              <Text className="text-lg font-bold text-black mb-3">
                Browse Talent
              </Text>
              {homeData.browseTalents.length === 0 && !loading ? (
                <Text className="text-gray-500 mb-3">
                  No Browse Talents available
                </Text>
              ) : (
                <View>
                  {homeData.browseTalents.map((talent) => (
                    <TalentCard
                      key={talent.id}
                      talent={talent}
                      showButtons={false}
                      onFavoriteToggle={toggleFavorite}
                      isFavorite={
                        favorites.includes(talent.id) || talent.isFavorite
                      }
                    />
                  ))}
                </View>
              )}
              <TouchableOpacity
                className="border border-gray-300 rounded-lg py-3 mt-4"
                onPress={handleBrowseAll}
              >
                <Text className="text-black text-center font-semibold">
                  Browse All
                </Text>
              </TouchableOpacity>
            </View>
            <BrowseByCategory onCategorySelect={handleCategorySelect} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default MainContentSection;
