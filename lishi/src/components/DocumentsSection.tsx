import React, { useState } from 'react'
import { Document, Dynasty } from '../types/history'

interface DocumentsSectionProps {
  documents: Document[]
  dynasties: Dynasty[]
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ documents, dynasties }) => {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const categories = ['all', ...Array.from(new Set(documents.map(d => d.category)))]

  const filteredDocs = filter === 'all' 
    ? documents 
    : documents.filter(d => d.category === filter)

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
      <div className="p-4 bg-gradient-to-r from-amber-100 to-yellow-100 border-b border-amber-200">
        <h2 className="text-2xl font-bold text-amber-900 font-kai">史料典籍</h2>
        <p className="text-sm text-amber-600 mt-1">阅读经典历史文献，感受古人智慧</p>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === cat
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-amber-100'
              }`}
            >
              {cat === 'all' ? '全部' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex">
        <div className="w-2/5 p-4 border-r border-gray-200 space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
          {filteredDocs.map(doc => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className={`w-full text-left p-4 rounded-xl transition-all card-hover ${
                selectedDoc?.id === doc.id
                  ? 'bg-amber-50 border-2 border-amber-400'
                  : 'bg-gray-50 border border-gray-200 hover:bg-amber-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-4xl">📜</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">{doc.title}</h3>
                  <p className="text-sm text-gray-500">{doc.author} · {formatYear(doc.year)}</p>
                  <div className="mt-2 flex gap-2">
                    <span 
                      className="px-2 py-1 rounded-full text-white text-xs"
                      style={{ backgroundColor: getDynastyColor(doc.dynasty) }}
                    >
                      {dynasties.find(d => d.id === doc.dynasty)?.name}
                    </span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                      {doc.category}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex-1 p-6">
          {selectedDoc ? (
            <div>
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">📖</div>
                <h3 className="text-3xl font-bold text-gray-800 font-kai">{selectedDoc.title}</h3>
                <p className="text-gray-500 mt-2">{selectedDoc.author} 著</p>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 mb-4">
                <h4 className="font-bold text-amber-800 mb-2">简介</h4>
                <p className="text-gray-700">{selectedDoc.description}</p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
                <h4 className="font-bold text-amber-800 mb-4 text-center">精选内容</h4>
                <div className="text-gray-700 leading-loose font-kai text-lg text-center">
                  {selectedDoc.content}
                </div>
              </div>

              <div className="mt-6 flex justify-center gap-4">
                <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-colors font-medium">
                  开始阅读
                </button>
                <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                  收藏典籍
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="text-6xl mb-4">📚</div>
              <p>请从左侧选择一部典籍</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentsSection
