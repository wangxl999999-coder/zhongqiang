import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Dynasty, HistoricalEvent } from '../types/history'

interface TimelineProps {
  dynasties: Dynasty[]
  events: HistoricalEvent[]
  onEventClick: (event: HistoricalEvent) => void
}

const Timeline: React.FC<TimelineProps> = ({ dynasties, events, onEventClick }) => {
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, offset: 0 })
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const minYear = -2100
  const maxYear = 1912
  const totalYears = maxYear - minYear
  const baseWidth = 3000
  const visibleWidth = baseWidth * zoom

  const yearToX = useCallback((year: number) => {
    return ((year - minYear) / totalYears) * visibleWidth + offset
  }, [zoom, offset, visibleWidth])

  const xToYear = useCallback((x: number) => {
    return minYear + ((x - offset) / visibleWidth) * totalYears
  }, [zoom, offset, visibleWidth])

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.min(Math.max(zoom * delta, 0.5), 5)
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseYear = xToYear(mouseX)
      const newVisibleWidth = baseWidth * newZoom
      const newOffset = mouseX - ((mouseYear - minYear) / totalYears) * newVisibleWidth
      setZoom(newZoom)
      setOffset(newOffset)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, offset })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - dragStart.x
    setOffset(dragStart.offset + deltaX)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleDynastyClick = (dynasty: Dynasty) => {
    const centerYear = (dynasty.startYear + dynasty.endYear) / 2
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.width / 2
      const newOffset = centerX - ((centerYear - minYear) / totalYears) * visibleWidth
      setOffset(newOffset)
    }
  }

  const formatYear = (year: number) => {
    if (year < 0) {
      return `公元前${Math.abs(year)}年`
    }
    return `公元${year}年`
  }

  const getEventColor = (type: HistoricalEvent['type']) => {
    const colors = {
      dynasty: '#8B4513',
      war: '#DC143C',
      culture: '#4169E1',
      emperor: '#FFD700',
      science: '#32CD32'
    }
    return colors[type]
  }

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const centerYear = 0
      const centerX = rect.width / 2
      const newOffset = centerX - ((centerYear - minYear) / totalYears) * visibleWidth
      setOffset(newOffset)
    }
  }, [])

  const majorYears = []
  for (let year = minYear; year <= maxYear; year += 500) {
    majorYears.push(year)
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-amber-900 font-kai">历史时间线</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
                className="w-8 h-8 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors"
              >
                -
              </button>
              <span className="text-sm text-amber-800 w-16 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(z => Math.min(z + 0.2, 5))}
                className="w-8 h-8 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors"
              >
                +
              </button>
            </div>
            <div className="flex gap-2">
              {['dynasty', 'war', 'culture', 'emperor'].map(type => (
                <div key={type} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getEventColor(type as any) }}></div>
                  <span className="text-xs text-amber-700">
                    {type === 'dynasty' ? '朝代' : type === 'war' ? '战争' : type === 'culture' ? '文化' : '帝王'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="timeline-container h-80 overflow-hidden relative"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute top-0 left-0 right-0 h-12 flex items-center border-b border-gray-200">
          {majorYears.map(year => {
            const x = yearToX(year)
            if (x < -100 || x > visibleWidth + 100) return null
            return (
              <div
                key={year}
                className="absolute text-sm text-gray-600 font-medium"
                style={{ left: x, transform: 'translateX(-50%)' }}
              >
                {formatYear(year)}
              </div>
            )
          })}
        </div>

        <div className="absolute top-12 left-0 right-0 h-16">
          {dynasties.map(dynasty => {
            const startX = yearToX(dynasty.startYear)
            const endX = yearToX(dynasty.endYear)
            const width = endX - startX
            if (width < 10) return null
            if (endX < 0 || startX > visibleWidth) return null
            return (
              <div
                key={dynasty.id}
                className="absolute h-12 top-2 rounded cursor-pointer transition-all hover:h-14 hover:top-1 hover:shadow-lg"
                style={{
                  left: Math.max(startX, 0),
                  width: Math.min(width, visibleWidth - startX),
                  backgroundColor: dynasty.color,
                  opacity: 0.85
                }}
                onClick={() => handleDynastyClick(dynasty)}
              >
                {width > 80 && (
                  <div className="h-full flex items-center justify-center text-white font-bold text-sm">
                    {dynasty.name}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="absolute top-28 left-0 right-0 h-40">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-300"></div>
          
          {events.map((event, index) => {
            const x = yearToX(event.year)
            if (x < -50 || x > visibleWidth + 50) return null
            
            const yOffset = (index % 4) * 30
            const isEven = Math.floor(index / 4) % 2 === 0
            
            return (
              <div
                key={event.id}
                className="absolute cursor-pointer timeline-event-dot"
                style={{
                  left: x,
                  top: isEven ? 10 + yOffset : 120 - yOffset,
                  transform: 'translateX(-50%)'
                }}
                onClick={() => onEventClick(event)}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: getEventColor(event.type) }}
                ></div>
                <div
                  className={`absolute left-1/2 w-px ${isEven ? 'top-4' : 'bottom-4'}`}
                  style={{ 
                    backgroundColor: getEventColor(event.type),
                    height: yOffset + 10,
                    transform: isEven ? 'none' : 'translateY(-100%)'
                  }}
                ></div>
                <div
                  className={`absolute whitespace-nowrap text-xs font-medium px-2 py-1 rounded bg-white shadow ${
                    isEven ? 'top-8' : 'bottom-8'
                  }`}
                  style={{ 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    color: getEventColor(event.type)
                  }}
                >
                  {event.title}
                </div>
              </div>
            )
          })}
        </div>

        {selectedYear !== null && (
          <div
            className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
            style={{ left: yearToX(selectedYear) }}
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500"></div>
          </div>
        )}
      </div>

      <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
        <span className="text-sm text-gray-500">💡 鼠标滚轮缩放，拖拽滑动时间线</span>
        <div className="flex gap-2">
          {dynasties.slice(0, 5).map(d => (
            <button
              key={d.id}
              onClick={() => handleDynastyClick(d)}
              className="px-3 py-1 text-xs rounded-full text-white"
              style={{ backgroundColor: d.color }}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Timeline
