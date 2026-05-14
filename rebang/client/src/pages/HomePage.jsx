import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import FilterBar from '../components/FilterBar';
import HotCard from '../components/HotCard';
import LoginModal from '../components/LoginModal';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const [hotItems, setHotItems] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [sortBy, setSortBy] = useState('hot');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [blockedKeywords, setBlockedKeywords] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchPlatforms();
    fetchCategories();
    fetchHotItems();
  }, [selectedPlatform, selectedCategory, sortBy]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
      fetchBlockedKeywords();
    }
  }, [user]);

  const fetchPlatforms = async () => {
    try {
      const response = await axios.get('/api/hotlist/platforms');
      setPlatforms(response.data);
    } catch (error) {
      console.error('获取平台列表失败:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/hotlist/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('获取分类列表失败:', error);
    }
  };

  const fetchHotItems = async () => {
    setLoading(true);
    try {
      const params = {
        platform: selectedPlatform,
        category: selectedCategory,
        sort: sortBy,
        search: searchQuery,
      };
      const response = await axios.get('/api/hotlist', { params });
      setHotItems(response.data.items);
    } catch (error) {
      console.error('获取热榜失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await axios.get('/api/hotlist/favorites');
      const favoriteIds = response.data.items.map((item) => item.id);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('获取收藏列表失败:', error);
    }
  };

  const fetchBlockedKeywords = async () => {
    try {
      const response = await axios.get('/api/hotlist/blocked-keywords');
      setBlockedKeywords(response.data.map((kw) => kw.keyword));
    } catch (error) {
      console.error('获取屏蔽关键词失败:', error);
    }
  };

  const handleSearch = () => {
    fetchHotItems();
  };

  const handleFavorite = async (itemId) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      if (favorites.includes(itemId)) {
        await axios.delete(`/api/hotlist/favorites/${itemId}`);
        setFavorites(favorites.filter((id) => id !== itemId));
      } else {
        await axios.post(`/api/hotlist/favorites/${itemId}`);
        setFavorites([...favorites, itemId]);
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
    }
  };

  const isItemBlocked = (item) => {
    if (blockedKeywords.length === 0) return false;
    const text = `${item.title} ${item.description || ''}`;
    return blockedKeywords.some((kw) => 
      text.toLowerCase().includes(kw.toLowerCase())
    );
  };

  const filteredItems = hotItems.filter((item) => !isItemBlocked(item));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onSearch={handleSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <FilterBar
          platforms={platforms}
          selectedPlatform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                <div className="h-5 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-1/6" />
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded-full" />
                    <div className="h-8 w-8 bg-gray-200 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">暂无数据</h3>
            <p className="text-gray-400">没有找到相关的热榜内容</p>
          </div>
        ) : (
          <>
            {user && blockedKeywords.length > 0 && hotItems.length !== filteredItems.length && (
              <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm text-gray-600">
                已屏蔽 {hotItems.length - filteredItems.length} 条包含敏感关键词的内容
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <HotCard
                  key={item.id}
                  item={item}
                  onFavorite={handleFavorite}
                  isFavorited={favorites.includes(item.id)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
