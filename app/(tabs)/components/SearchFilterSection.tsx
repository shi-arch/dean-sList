import debounce from "lodash/debounce";
import React, { useCallback, useEffect, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import Assets from "../../../assets";
import CategoriesSection from "./CategoriesSection";
import FilterButton from "./FilterButton";

interface SearchFilterSectionProps {
  placeholder?: string;
  onSearchChange?: (query: string) => void;
  isSearching?: boolean;
  searchQuery?: string; // Add searchQuery prop to sync with parent state
  onApplyFilters: (filters: any) => void;
}

const SearchFilterSection: React.FC<SearchFilterSectionProps> = ({
  placeholder = "What are you looking for?",
  onSearchChange,
  isSearching = false,
  searchQuery: parentSearchQuery = "", // Rename to avoid conflict
   onApplyFilters, 
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(parentSearchQuery);

  // Sync localSearchQuery with parentSearchQuery when it changes
  useEffect(() => {
    setLocalSearchQuery(parentSearchQuery);
  }, [parentSearchQuery]);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim() !== "") {
        onSearchChange?.(query);
      } else {
        onSearchChange?.(""); // Clear search when query is empty
      }
    }, 500),
    [onSearchChange]
  );

  const handleSearchChange = (text: string) => {
    setLocalSearchQuery(text);
    debouncedSearch(text);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <View className="mb-3">
      <View className="flex-row items-center mb-0">
        <View className="flex-1 flex-row items-center border border-gray-300 rounded-lg px-3 py-1">
          <Assets.icons.search
            width={24}
            height={24}
            stroke="#9CA3AF"
            strokeWidth="1.5"
            fill="none"
          />
          <TextInput
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-base pl-3"
            value={localSearchQuery}
            onChangeText={handleSearchChange}
          />
          {localSearchQuery && isSearching &&(
            <TouchableOpacity
              onPress={() => handleSearchChange("")}
              className="ml-2"
            >
              <Assets.icons.close
                width={18}
                height={18}
                stroke="#9CA3AF"
                strokeWidth="1.5"
                fill="none"
              />
            </TouchableOpacity>
          )}
        </View>
        <FilterButton onApplyFilters={onApplyFilters} />
      </View>
      {!isSearching && (
        <CategoriesSection
          categories={["Musician", "Singer", "Guitarist", "Drummer"]}
          onCategoryPress={handleSearchChange}
        />
      )}
    </View>
  );
};

export default SearchFilterSection;