import React from 'react'
import { Person, Dynasty, HistoricalEvent } from '../types/history'

interface PersonModalProps {
  person: Person | null
  dynasty?: Dynasty
  relatedEvents: HistoricalEvent[]
  sameDynastyPeople: Person[]
  onClose: () => void
  onPersonClick: (person: Person) => void
}

const PersonModal: React.FC<PersonModalProps> = ({ 
  person, 
  dynasty, 
  relatedEvents, 
  sameDynastyPeople,
  onClose, 
  onPersonClick 
}) => {
  if (!person) return null

  const formatYear = (year: number) => {
    if (year < 0) {
      return `公元前${Math.abs(year)}年`
    }
    return `公元${year}年`
  }

  const categoryLabels: Record<string, string> = {
    emperor: '帝王',
    general: '将相',
    scholar: '文人',
    military: '武将',
    thinker: '思想家',
    scientist: '科学家',
    artist: '艺术家',
    other: '其他'
  }

  const categoryColors: Record<string, string> = {
    emperor: 'from-yellow-400 to-amber-500',
    general: 'from-blue-400 to-blue-600',
    scholar: 'from-green-400 to-emerald-600',
    military: 'from-red-400 to-red-600',
    thinker: 'from-purple-400 to-purple-600',
    scientist: 'from-cyan-400 to-cyan-600',
    artist: 'from-pink-400 to-pink-600',
    other: 'from-gray-400 to-gray-600'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <div className={`h-3 bg-gradient-to-r ${categoryColors[person.category]}`}></div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 z-10"
          >
            ✕
          </button>
          
          <div className="p-6">
            <div className="flex items-start gap-6 mb-6">
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${categoryColors[person.category]} flex items-center justify-center text-white text-4xl font-bold shadow-lg`}>
                {person.name[0]}
              </div>
              
              <div className="flex-1">
                <h2 className="text-4xl font-bold text-gray-800 mb-2 font-kai">{person.name}</h2>
                <p className="text-xl text-gray-600 mb-2">{person.identity}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {categoryLabels[person.category]}
                  </span>
                  {dynasty && (
                    <span 
                      className="px-3 py-1 rounded-full text-white text-sm"
                      style={{ backgroundColor: dynasty.color }}
                    >
                      {dynasty.name}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-500">
                  📅 {formatYear(person.birthYear)} - {formatYear(person.deathYear)}
                  {person.birthplace && `  ·  📍 ${person.birthplace}`}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-amber-50 rounded-xl p-4">
                  <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                    <span>🏆</span> 主要成就
                  </h3>
                  <ul className="space-y-2">
                    {person.mainAchievements.map((achievement, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <span className="text-amber-500 mt-1">•</span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <span>📖</span> 历史评价
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{person.evaluation}</p>
                </div>
              </div>

              <div className="space-y-4">
                {relatedEvents.length > 0 && (
                  <div className="bg-red-50 rounded-xl p-4">
                    <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                      <span>⚔️</span> 相关历史事件
                    </h3>
                    <div className="space-y-2">
                      {relatedEvents.slice(0, 3).map(event => (
                        <div key={event.id} className="bg-white rounded-lg p-3 border border-red-100">
                          <h4 className="font-medium text-gray-800">{event.title}</h4>
                          <p className="text-xs text-gray-500">{formatYear(event.year)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sameDynastyPeople.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                      <span>👥</span> 同时期人物推荐
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {sameDynastyPeople.slice(0, 6).map(p => (
                        <button
                          key={p.id}
                          onClick={() => onPersonClick(p)}
                          className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                        >
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: `linear-gradient(135deg, ${p.category === 'emperor' ? '#FFD700' : p.category === 'scholar' ? '#32CD32' : '#4169E1'}, #888)` }}
                          >
                            {p.name[0]}
                          </div>
                          <span className="text-sm text-gray-700">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                关闭
              </button>
              <button
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors font-medium"
              >
                查看关系图谱
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonModal
