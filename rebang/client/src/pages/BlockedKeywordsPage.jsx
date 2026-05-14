import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Settings, ArrowLeft, Plus, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function BlockedKeywordsPage() {
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchKeywords();
    }
  }, [user]);

  const fetchKeywords = async () => {
    try {
      const response = await axios.get('/api/hotlist/blocked-keywords');
      setKeywords(response.data);
    } catch (error) {
      console.error('获取屏蔽关键词失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = async (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    try {
      await axios.post('/api/hotlist/blocked-keywords', {
        keyword: newKeyword.trim()
      });
      setNewKeyword('');
      await fetchKeywords();
    } catch (error) {
      console.error('添加屏蔽关键词失败:', error);
    }
  };

  const removeKeyword = async (id) => {
    try {
      await axios.delete(`/api/hotlist/blocked-keywords/${id}`);
      setKeywords(keywords.filter(k => k.id !== id));
    } catch (error) {
      console.error('删除屏蔽关键词失败:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <ShieldAlert className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-600 mb-2">请先登录</h2>
            <p className="text-gray-400 mb-4">登录后可以设置屏蔽关键词</p>
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
          <div>
            <h1 className="text-2xl font-bold text-gray-800">屏蔽设置</h1>
            <p className="text-sm text-gray-500 mt-1">设置关键词后，相关热榜内容将不再显示</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">添加屏蔽关键词</h2>
          <form onSubmit={addKeyword} className="flex gap-3">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="输入要屏蔽的关键词..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            已屏蔽关键词 ({keywords.length})
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : keywords.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">暂无屏蔽关键词</p>
              <p className="text-sm text-gray-400 mt-1">添加关键词后，相关热榜内容将被过滤</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw) => (
                <div
                  key={kw.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm"
                >
                  <span className="text-gray-700">{kw.keyword}</span>
                  <button
                    onClick={() => removeKeyword(kw.id)}
                    className="p-0.5 hover:bg-gray-200 rounded-full text-gray-500 hover:text-red-500 transition-colors"
                    title="删除"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">提示</h3>
              <p className="text-sm text-yellow-700 mt-1">
                屏蔽关键词功能仅对您当前账号生效，不会影响其他用户。
                屏蔽后，包含该关键词的热榜内容将不再显示在首页。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
