import { Heart, ExternalLink, TrendingUp } from 'lucide-react';

export default function HotCard({ item, onFavorite, isFavorited }) {
  const formatHotValue = (value) => {
    if (value >= 10000000) {
      return `${(value / 10000000).toFixed(1)}千万`;
    }
    if (value >= 10000) {
      return `${(value / 10000).toFixed(1)}万`;
    }
    return value.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="px-2 py-0.5 rounded text-xs font-medium text-white"
              style={{ backgroundColor: item.color || '#666' }}
            >
              {item.display_name || item.platform_name}
            </span>
            {item.multi_platform > 1 && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {item.multi_platform}平台上榜
              </span>
            )}
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
              {item.category}
            </span>
          </div>
          
          <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer">
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => onFavorite(item.id)}
                className={`p-1.5 rounded-full transition-colors ${
                  isFavorited
                    ? 'bg-red-100 text-red-500'
                    : 'hover:bg-gray-100 text-gray-400'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        
        {item.image_url && (
          <img
            src={item.image_url}
            alt=""
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          />
        )}
      </div>
    </div>
  );
}
