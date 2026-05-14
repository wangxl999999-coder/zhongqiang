import React from 'react'
import { HistoricalEvent, Person } from '../types/history'

interface EventModalProps {
  event: HistoricalEvent | null
  people: Person[]
  onClose: () => void
  onPersonClick: (person: Person) => void
}

const EventModal: React.FC<EventModalProps> = ({ event, people, onClose, onPersonClick }) => {
  if (!event) return null

  const relatedPeople = people.filter(p => event.relatedPeople.includes(p.id))

  const formatYear = (year: number) => {
    if (year < 0) {
      return `公元前${Math.abs(year)}年`
    }
    return `公元${year}年`
  }

  const getTypeLabel = (type: HistoricalEvent['type']) => {
    const labels = {
      dynasty: '朝代',
      war: '战争',
      culture: '文化',
      emperor: '帝王',
      science: '科技'
    }
    return labels[type]
  }

  const getTypeColor = (type: HistoricalEvent['type']) => {
    const colors = {
      dynasty: 'bg-amber-500',
      war: 'bg-red-500',
      culture: 'bg-blue-500',
      emperor: 'bg-yellow-500',
      science: 'bg-green-500'
    }
    return colors[type]
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <div className={`h-2 ${getTypeColor(event.type)}`}></div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
          >
            ✕
          </button>
          
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-white text-sm ${getTypeColor(event.type)}`}>
                {getTypeLabel(event.type)}
              </span>
              <span className="text-lg font-bold text-amber-800">{formatYear(event.year)}</span>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-kai">{event.title}</h2>
            
            {event.location && (
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <span>📍</span>
                <span>{event.location}</span>
              </div>
            )}
            
            <div className="bg-amber-50 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-amber-800 mb-2">事件简介</h3>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>
            
            {relatedPeople.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3">相关人物</h3>
                <div className="flex flex-wrap gap-3">
                  {relatedPeople.map(person => (
                    <button
                      key={person.id}
                      onClick={() => onPersonClick(person)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-amber-50 hover:border-amber-300 transition-all card-hover"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                        {person.name[0]}
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-800">{person.name}</div>
                        <div className="text-xs text-gray-500">{person.identity}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                关闭
              </button>
              <button
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-colors font-medium"
              >
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventModal
