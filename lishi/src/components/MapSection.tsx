import React, { useState } from 'react'
import { MapItem, Dynasty } from '../types/history'

interface MapSectionProps {
  maps: MapItem[]
  dynasties: Dynasty[]
}

const typeLabels: Record<MapItem['type'], string> = {
  territory: '疆域',
  war: '战争',
  trade: '贸易',
  migration: '迁徙'
}

const typeColors: Record<MapItem['type'], string> = {
  territory: 'from-blue-400 to-blue-600',
  war: 'from-red-400 to-red-600',
  trade: 'from-green-400 to-green-600',
  migration: 'from-purple-400 to-purple-600'
}

const MapSection: React.FC<MapSectionProps> = ({ maps, dynasties }) => {
  const [selectedMap, setSelectedMap] = useState<MapItem | null>(maps[0] || null)

  const getDynastyColor = (dynastyId: string) => {
    const dynasty = dynasties.find(d => d.id === dynastyId)
    return dynasty?.color || '#888'
  }

  const formatYear = (year: number) => {
    if (year < 0) {
      return `公元前${Math.abs(year)}年`
    }
    return `公元${year}年`
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-100 to-cyan-100 border-b border-blue-200">
        <h2 className="text-2xl font-bold text-blue-900 font-kai">历史地图</h2>
        <p className="text-sm text-blue-600 mt-1">探索不同时期的疆域变迁与历史地理</p>
      </div>

      <div className="flex">
        <div className="w-1/3 p-4 border-r border-gray-200 space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
          {maps.map(map => (
            <button
              key={map.id}
              onClick={() => setSelectedMap(map)}
              className={`w-full text-left p-3 rounded-xl transition-all ${
                selectedMap?.id === map.id
                  ? 'bg-blue-50 border-2 border-blue-400 shadow-md'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span 
                  className={`px-2 py-1 rounded-full text-white text-xs bg-gradient-to-r ${typeColors[map.type]}`}
                >
                  {typeLabels[map.type]}
                </span>
                <span 
                  className="px-2 py-1 rounded-full text-white text-xs"
                  style={{ backgroundColor: getDynastyColor(map.dynasty) }}
                >
                  {dynasties.find(d => d.id === map.dynasty)?.name}
                </span>
              </div>
              <h3 className="font-bold text-gray-800">{map.name}</h3>
              <p className="text-xs text-gray-500">{formatYear(map.year)}</p>
            </button>
          ))}
        </div>

        <div className="flex-1 p-4">
          {selectedMap && (
            <div>
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-64 flex items-center justify-center mb-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <svg viewBox="0 0 400 300" className="w-full h-full">
                    <path
                      d="M50,150 Q100,100 150,120 T250,100 T350,150 Q370,200 300,220 T150,200 T50,150"
                      fill={getDynastyColor(selectedMap.dynasty)}
                    />
                  </svg>
                </div>
                <div className="text-center z-10">
                  <div className="text-6xl mb-2">🗺️</div>
                  <h3 className="text-xl font-bold text-gray-700">{selectedMap.name}</h3>
                  <p className="text-gray-500">{formatYear(selectedMap.year)}</p>
                </div>
                <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                  交互地图开发中...
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-bold text-blue-800 mb-2">地图说明</h4>
                <p className="text-gray-700">{selectedMap.description}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-amber-50 rounded-lg p-3">
                  <div className="text-2xl mb-1">📏</div>
                  <div className="text-xs text-gray-500">面积</div>
                  <div className="font-bold text-amber-700">约 {Math.floor(Math.random() * 500 + 300)} 万平方公里</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-2xl mb-1">🏛️</div>
                  <div className="text-xs text-gray-500">都城</div>
                  <div className="font-bold text-green-700">{dynasties.find(d => d.id === selectedMap.dynasty)?.capital || '未知'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MapSection
