import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get('/api/hotlist/favorites');
      setFavorites(response.data.items);
    } catch (error) {
      console.error('获取收藏列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id) => {
    try {
      await axios.delete(`/api/hotlist/favorites/${id}`);
      setFavorites(favorites.filter(item => item.id !== id));
    } catch (error) {
      console.error('取消收藏失败:', error);
    }
  };

  const formatHotValue = (value) => {
    if (value >= 10000000) {
      return `${(value / 10000000).toFixed(1)}千万`;
    }
    if (value >= 10000) {
      return `${(value / 10000).toFixed(1)}万`;
    }
    return value.toString();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-600 mb-2">请先登录</h2>
            <p className="text-gray-400 mb-4">登录后可以查看您的收藏</p>
            <Link to="/" className="text-blue-500 hover:text-blue-600">
              返回首页登录
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/" className="mr-4 p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">我的收藏</h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                <div className="h-5 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-600 mb-2">暂无收藏</h2>
            <p className="text-gray-400 mb-4">去首页收藏感兴趣的话题吧</p>
            <Link to="/" className="text-blue-500 hover:text-blue-600">
              返回首页
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: item.color || '#666' }}
                      >
                        {item.display_name || item.platform_name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-800 mb-2 hover:text-blue-600 cursor-pointer">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        热度 {formatHotValue(item.hot_value)}
                      </span>
                      <button
                        onClick={() => removeFavorite(item.id)}
                        className="p-1.5 rounded-full hover:bg-red-50 text-red-500"
                        title="取消收藏"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
