import React, { useEffect, useRef, useState } from 'react'
import { Person, Relationship } from '../types/history'

interface RelationshipGraphProps {
  people: Person[]
  relationships: Relationship[]
  centerPerson?: Person | null
  onPersonClick: (person: Person) => void
}

interface Node {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  person: Person
}

interface Edge {
  source: string
  target: string
  type: Relationship['type']
}

const relationshipColors: Record<Relationship['type'], string> = {
  lord: '#FFD700',
  teacher: '#8B4513',
  opponent: '#DC143C',
  relative: '#FF69B4',
  ally: '#32CD32',
  friend: '#4169E1'
}

const relationshipLabels: Record<Relationship['type'], string> = {
  lord: '君臣',
  teacher: '师徒',
  opponent: '对手',
  relative: '亲属',
  ally: '盟友',
  friend: '朋友'
}

const RelationshipGraph: React.FC<RelationshipGraphProps> = ({ 
  people, 
  relationships, 
  centerPerson,
  onPersonClick 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const edgesRef = useRef<Edge[]>([])
  const animationRef = useRef<number>()
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null)

  const categoryColors: Record<string, string> = {
    emperor: '#FFD700',
    general: '#4169E1',
    scholar: '#32CD32',
    military: '#DC143C',
    thinker: '#9932CC',
    scientist: '#00CED1',
    artist: '#FF69B4',
    other: '#808080'
  }

  useEffect(() => {
    const width = 800
    const height = 500
    const centerX = width / 2
    const centerY = height / 2

    const relevantPersonIds = new Set<string>()
    if (centerPerson) {
      relevantPersonIds.add(centerPerson.id)
      relationships.forEach(r => {
        if (r.source === centerPerson.id || r.target === centerPerson.id) {
          relevantPersonIds.add(r.source)
          relevantPersonIds.add(r.target)
        }
      })
    } else {
      people.slice(0, 12).forEach(p => relevantPersonIds.add(p.id))
      relationships.forEach(r => {
        if (relevantPersonIds.has(r.source) && relevantPersonIds.has(r.target)) {
        } else if (relevantPersonIds.has(r.source)) {
          relevantPersonIds.add(r.target)
        } else if (relevantPersonIds.has(r.target)) {
          relevantPersonIds.add(r.source)
        }
      })
    }

    const relevantPeople = people.filter(p => relevantPersonIds.has(p.id))
    const relevantEdges = relationships.filter(
      r => relevantPersonIds.has(r.source) && relevantPersonIds.has(r.target)
    )

    const nodes: Node[] = relevantPeople.map((person, i) => {
      const angle = (i / relevantPeople.length) * Math.PI * 2
      const radius = centerPerson && person.id === centerPerson.id ? 0 : 150
      return {
        id: person.id,
        x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 50,
        y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 50,
        vx: 0,
        vy: 0,
        person
      }
    })

    nodesRef.current = nodes
    edgesRef.current = relevantEdges.map(r => ({
      source: r.source,
      target: r.target,
      type: r.type
    }))

  }, [people, relationships, centerPerson])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    const simulate = () => {
      const nodes = nodesRef.current
      const edges = edgesRef.current

      nodes.forEach(node => {
        nodes.forEach(other => {
          if (node.id !== other.id) {
            const dx = node.x - other.x
            const dy = node.y - other.y
            const dist = Math.sqrt(dx * dx + dy * dy) || 1
            const force = 2000 / (dist * dist)
            node.vx += (dx / dist) * force
            node.vy += (dy / dist) * force
          }
        })
      })

      edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source)
        const target = nodes.find(n => n.id === edge.target)
        if (source && target) {
          const dx = target.x - source.x
          const dy = target.y - source.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = (dist - 100) * 0.01
          source.vx += (dx / dist) * force
          source.vy += (dy / dist) * force
          target.vx -= (dx / dist) * force
          target.vy -= (dy / dist) * force
        }
      })

      const centerX = width / 2
      const centerY = height / 2
      nodes.forEach(node => {
        const dx = centerX - node.x
        const dy = centerY - node.y
        node.vx += dx * 0.001
        node.vy += dy * 0.001
      })

      nodes.forEach(node => {
        node.vx *= 0.9
        node.vy *= 0.9
        node.x += node.vx
        node.y += node.vy
        node.x = Math.max(30, Math.min(width - 30, node.x))
        node.y = Math.max(30, Math.min(height - 30, node.y))
      })
    }

    const render = () => {
      const nodes = nodesRef.current
      const edges = edgesRef.current

      ctx.clearRect(0, 0, width, height)

      ctx.strokeStyle = '#f0f0f0'
      ctx.lineWidth = 1
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source)
        const target = nodes.find(n => n.id === edge.target)
        if (source && target) {
          ctx.beginPath()
          ctx.moveTo(source.x, source.y)
          ctx.lineTo(target.x, target.y)
          ctx.strokeStyle = relationshipColors[edge.type]
          ctx.lineWidth = 2
          ctx.setLineDash([5, 5])
          ctx.stroke()
          ctx.setLineDash([])

          const midX = (source.x + target.x) / 2
          const midY = (source.y + target.y) / 2
          ctx.fillStyle = '#fff'
          ctx.fillRect(midX - 20, midY - 10, 40, 20)
          ctx.fillStyle = relationshipColors[edge.type]
          ctx.font = '10px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(relationshipLabels[edge.type], midX, midY)
        }
      })

      nodes.forEach(node => {
        const isHovered = hoveredNode?.id === node.id
        const isCenter = centerPerson?.id === node.id
        const radius = isCenter ? 35 : isHovered ? 30 : 25

        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, radius
        )
        gradient.addColorStop(0, categoryColors[node.person.category])
        gradient.addColorStop(1, categoryColors[node.person.category] + '80')

        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
        ctx.strokeStyle = isCenter ? '#FFD700' : '#fff'
        ctx.lineWidth = isCenter ? 4 : 3
        ctx.stroke()

        ctx.fillStyle = '#fff'
        ctx.font = isHovered ? 'bold 14px sans-serif' : 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(node.person.name[0], node.x, node.y)

        ctx.fillStyle = '#333'
        ctx.font = '11px sans-serif'
        ctx.fillText(node.person.name, node.x, node.y + radius + 15)
      })
    }

    const animate = () => {
      simulate()
      render()
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [hoveredNode, centerPerson])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const hovered = nodesRef.current.find(node => {
      const dx = node.x - x
      const dy = node.y - y
      return Math.sqrt(dx * dx + dy * dy) < 30
    }) || null

    setHoveredNode(hovered)
    canvas.style.cursor = hovered ? 'pointer' : 'default'
  }

  const handleClick = () => {
    if (hoveredNode) {
      onPersonClick(hoveredNode.person)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 border-b border-purple-200">
        <h2 className="text-2xl font-bold text-purple-900 font-kai">人物关系图谱</h2>
        <p className="text-sm text-purple-600 mt-1">点击人物节点查看详情</p>
      </div>

      <div className="p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full rounded-lg border border-gray-200"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        />
      </div>

      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-4 justify-center">
          {Object.entries(relationshipColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div className="w-4 h-1" style={{ backgroundColor: color }}></div>
              <span className="text-xs text-gray-600">{relationshipLabels[type as Relationship['type']]}</span>
            </div>
          ))}
        </div>
      </div>

      {hoveredNode && (
        <div className="p-3 bg-purple-50 border-t border-purple-200">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: categoryColors[hoveredNode.person.category] }}
            >
              {hoveredNode.person.name[0]}
            </div>
            <div>
              <h3 className="font-bold text-purple-900">{hoveredNode.person.name}</h3>
              <p className="text-sm text-purple-700">{hoveredNode.person.identity}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RelationshipGraph
