import { Filter, ArrowUpDown } from 'lucide-react';

export default function FilterBar({
  platforms,
  selectedPlatform,
  onPlatformChange,
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">平台:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onPlatformChange('')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedPlatform === ''
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {platforms.map((platform) => (
              <button
                key={platform.name}
                onClick={() => onPlatformChange(platform.name)}
                className={`px-3 py-1 rounded-full text-sm transition-colors flex items-center gap-1 ${
                  selectedPlatform === platform.name
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: platform.color }}
                />
                {platform.display_name}
              </button>
            ))}
          </div>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">分类:</span>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-1 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">排序:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-1 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="hot">按热度</option>
            <option value="time">按时间</option>
          </select>
        </div>
      </div>
    </div>
  );
}
