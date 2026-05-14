import React, { useState } from 'react'
import { Person, PersonCategory } from '../types/history'

interface PersonLibraryProps {
  people: Person[]
  onPersonClick: (person: Person) => void
}

const categoryLabels: Record<PersonCategory, string> = {
  emperor: '帝王',
  general: '将相',
  scholar: '文人',
  military: '武将',
  thinker: '思想家',
  scientist: '科学家',
  artist: '艺术家',
  other: '其他'
}

const categoryColors: Record<PersonCategory, string> = {
  emperor: 'from-yellow-400 to-amber-500',
  general: 'from-blue-400 to-blue-600',
  scholar: 'from-green-400 to-emerald-600',
  military: 'from-red-400 to-red-600',
  thinker: 'from-purple-400 to-purple-600',
  scientist: 'from-cyan-400 to-cyan-600',
  artist: 'from-pink-400 to-pink-600',
  other: 'from-gray-400 to-gray-600'
}

const PersonLibrary: React.FC<PersonLibraryProps> = ({ people, onPersonClick }) => {
  const [selectedCategory, setSelectedCategory] = useState<PersonCategory | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPeople = people.filter(person => {
    const matchCategory = selectedCategory === 'all' || person.category === selectedCategory
    const matchSearch = person.name.includes(searchTerm) || 
                        person.identity.includes(searchTerm) ||
                        person.dynasty.includes(searchTerm)
    return matchCategory && matchSearch
  })

  const categories: (PersonCategory | 'all')[] = ['all', 'emperor', 'general', 'scholar', 'military', 'thinker', 'scientist', 'artist']

  const formatYear = (year: number) => {
    if (year < 0) {
      return `公元前${Math.abs(year)}`
    }
    return `公元${year}`
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-emerald-100 to-teal-100 border-b border-emerald-200">
        <h2 className="text-2xl font-bold text-emerald-900 mb-4 font-kai">历史人物库</h2>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              {cat === 'all' ? '全部' : categoryLabels[cat]}
            </button>
          ))}
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="搜索人物姓名、身份、朝代..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
      </div>

      <div className="p-4 max-h-96 overflow-y-auto scrollbar-thin">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeople.map(person => (
            <button
              key={person.id}
              onClick={() => onPersonClick(person)}
              className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100 hover:shadow-lg transition-all card-hover text-left"
            >
              <div className="flex items-start gap-3">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${categoryColors[person.category]} flex items-center justify-center text-white text-xl font-bold shadow-md`}>
                  {person.name[0]}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">{person.name}</h3>
                  <p className="text-sm text-gray-500">{person.identity}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatYear(person.birthYear)} - {formatYear(person.deathYear)}
                  </p>
                </div>
              </div>
              
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                  {categoryLabels[person.category]}
                </span>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                  {person.dynasty}
                </span>
              </div>
              
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {person.mainAchievements.slice(0, 2).join('、')}
              </p>
            </button>
          ))}
        </div>
        
        {filteredPeople.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl">📜</span>
            <p className="mt-2">没有找到符合条件的人物</p>
          </div>
        )}
      </div>
      
      <div className="p-3 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-500">
        共 {filteredPeople.length} 位历史人物
      </div>
    </div>
  )
}

export default PersonLibrary
