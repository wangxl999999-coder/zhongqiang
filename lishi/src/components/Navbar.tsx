import React from 'react'

interface NavbarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'home', label: '首页', icon: '🏠' },
    { id: 'timeline', label: '时间线', icon: '📅' },
    { id: 'people', label: '人物', icon: '👥' },
    { id: 'wars', label: '战争', icon: '⚔️' },
    { id: 'maps', label: '地图', icon: '🗺️' },
    { id: 'documents', label: '典籍', icon: '📚' },
  ]

  return (
    <nav className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏛️</span>
            <h1 className="text-2xl font-bold text-white font-kai tracking-wider">全历史</h1>
          </div>

          <div className="flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  currentPage === item.id
                    ? 'bg-white bg-opacity-20 text-white shadow-inner'
                    : 'text-amber-100 hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <span>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索历史..."
                className="w-48 px-4 py-2 pl-10 rounded-full bg-amber-700 bg-opacity-50 text-white placeholder-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-200">🔍</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
