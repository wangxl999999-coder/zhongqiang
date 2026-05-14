import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Timeline from './components/Timeline'
import PersonLibrary from './components/PersonLibrary'
import RelationshipGraph from './components/RelationshipGraph'
import MapSection from './components/MapSection'
import DocumentsSection from './components/DocumentsSection'
import EventModal from './components/EventModal'
import PersonModal from './components/PersonModal'
import { dynasties, events, people, relationships, wars, maps, documents } from './data/mockData'
import { Person, HistoricalEvent } from './types/history'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [graphCenterPerson, setGraphCenterPerson] = useState<Person | null>(null)

  const handleEventClick = (event: HistoricalEvent) => {
    setSelectedEvent(event)
  }

  const handlePersonClick = (person: Person) => {
    setSelectedPerson(person)
    setGraphCenterPerson(person)
  }

  const personDynasty = selectedPerson 
    ? dynasties.find(d => d.id === selectedPerson.dynasty)
    : undefined

  const personRelatedEvents = selectedPerson
    ? events.filter(e => e.relatedPeople.includes(selectedPerson.id))
    : []

  const sameDynastyPeople = selectedPerson
    ? people.filter(p => p.dynasty === selectedPerson.dynasty && p.id !== selectedPerson.id)
    : []

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-8 text-white">
              <div className="max-w-3xl">
                <h1 className="text-5xl font-bold mb-4 font-kai">探索历史的魅力</h1>
                <p className="text-xl mb-6 opacity-90">
                  一站式全网全历史学习平台，涵盖中国史、世界史、朝代史、人物史、战争史、文化史
                </p>
                <div className="flex flex-wrap gap-3">
                  {['时间线', '人物关系', '历史地图', '史料典籍'].map((tag, i) => (
                    <span key={i} className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm">
                      ✨ {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {[
                { icon: '📅', title: '时间线', desc: '可视化历史长河', color: 'from-amber-400 to-orange-500' },
                { icon: '👥', title: '人物库', desc: '历史人物百科', color: 'from-emerald-400 to-teal-500' },
                { icon: '⚔️', title: '战争史', desc: '经典战役回顾', color: 'from-red-400 to-rose-500' },
                { icon: '🗺️', title: '地图', desc: '疆域变迁', color: 'from-blue-400 to-indigo-500' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow card-hover">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-3xl mb-4`}>
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>

            <Timeline 
              dynasties={dynasties} 
              events={events} 
              onEventClick={handleEventClick} 
            />

            <div className="grid md:grid-cols-2 gap-6">
              <PersonLibrary people={people} onPersonClick={handlePersonClick} />
              <RelationshipGraph 
                people={people} 
                relationships={relationships}
                centerPerson={graphCenterPerson}
                onPersonClick={handlePersonClick}
              />
            </div>
          </div>
        )

      case 'timeline':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 font-kai">📅 历史时间线</h2>
            <Timeline 
              dynasties={dynasties} 
              events={events} 
              onEventClick={handleEventClick} 
            />
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dynasties.map(dynasty => (
                <div 
                  key={dynasty.id}
                  className="bg-white rounded-xl p-5 shadow-md"
                  style={{ borderTop: `4px solid ${dynasty.color}` }}
                >
                  <h3 className="font-bold text-lg mb-2">{dynasty.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {dynasty.startYear < 0 ? `公元前${Math.abs(dynasty.startYear)}` : `公元${dynasty.startYear}`} 
                    - 
                    {dynasty.endYear < 0 ? `公元前${Math.abs(dynasty.endYear)}` : `公元${dynasty.endYear}`}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-2">{dynasty.description}</p>
                </div>
              ))}
            </div>
          </div>
        )

      case 'people':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 font-kai">👥 历史人物</h2>
            <PersonLibrary people={people} onPersonClick={handlePersonClick} />
            <RelationshipGraph 
              people={people} 
              relationships={relationships}
              centerPerson={graphCenterPerson}
              onPersonClick={handlePersonClick}
            />
          </div>
        )

      case 'wars':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 font-kai">⚔️ 战争历史</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wars.map(war => (
                <div key={war.id} className="bg-white rounded-xl shadow-md overflow-hidden card-hover">
                  <div className="h-32 bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center">
                    <span className="text-6xl">⚔️</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-xl text-gray-800 mb-2">{war.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {war.startYear < 0 ? `公元前${Math.abs(war.startYear)}` : `公元${war.startYear}`}
                      {war.endYear && ` - ${war.endYear < 0 ? `公元前${Math.abs(war.endYear)}` : `公元${war.endYear}`}`}
                    </p>
                    <p className="text-gray-600 text-sm mb-4">{war.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {war.commanders.slice(0, 3).map((cmd, i) => (
                        <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                          {cmd}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'maps':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 font-kai">🗺️ 历史地图</h2>
            <MapSection maps={maps} dynasties={dynasties} />
          </div>
        )

      case 'documents':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 font-kai">📚 史料典籍</h2>
            <DocumentsSection documents={documents} dynasties={dynasties} />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderPage()}
      </main>

      <footer className="bg-amber-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏛️</span>
              <h2 className="text-2xl font-bold font-kai">全历史</h2>
            </div>
            <p className="text-amber-200 text-sm">
              © 2024 全历史平台 - 让历史学习更有趣
            </p>
          </div>
        </div>
      </footer>

      <EventModal 
        event={selectedEvent} 
        people={people}
        onClose={() => setSelectedEvent(null)}
        onPersonClick={handlePersonClick}
      />

      <PersonModal 
        person={selectedPerson}
        dynasty={personDynasty}
        relatedEvents={personRelatedEvents}
        sameDynastyPeople={sameDynastyPeople}
        onClose={() => setSelectedPerson(null)}
        onPersonClick={handlePersonClick}
      />
    </div>
  )
}

export default App
