  // app/(tabs)/home.tsx
  import React, { useEffect, useState } from 'react';
  import { ScrollView, View } from 'react-native';
  import "../../global.css";
  import BrowseByCategory from './components/BrowseByCategory';
  import ContentSection from './components/ContentSection';
  import HeaderSection from './components/HeaderSection';
  import MainHeader from './components/MainHeader';
  import ProfileCompletion from './components/ProfileCompletion';
  import SearchFilterSection from './components/SearchFilterSection';
  import MainContentSection from './content-section/MainContentSection';

  const Home: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
      // Set isSearching based on whether there's a search query
      setIsSearching(searchQuery.trim() !== '');
    }, [searchQuery]);

    const handleSearchChange = (query: string) => {
      setSearchQuery(query);
    };

    return (
      
      <MainContentSection />
    );
  };

  export default Home;
