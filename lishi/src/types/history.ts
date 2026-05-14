export interface Dynasty {
  id: string
  name: string
  startYear: number
  endYear: number
  color: string
  capital: string
  description: string
  emperors: string[]
}

export interface HistoricalEvent {
  id: string
  title: string
  year: number
  month?: number
  day?: number
  type: 'dynasty' | 'war' | 'culture' | 'emperor' | 'science'
  dynasty?: string
  location?: string
  description: string
  relatedPeople: string[]
  relatedEvents: string[]
  relatedMaps?: string[]
}

export interface Person {
  id: string
  name: string
  birthYear: number
  deathYear: number
  dynasty: string
  category: PersonCategory
  identity: string
  birthplace?: string
  mainAchievements: string[]
  evaluation: string
  avatar?: string
}

export type PersonCategory = 'emperor' | 'general' | 'scholar' | 'military' | 'thinker' | 'scientist' | 'artist' | 'other'

export interface Relationship {
  id: string
  source: string
  target: string
  type: 'lord' | 'teacher' | 'opponent' | 'relative' | 'ally' | 'friend'
  description?: string
}

export interface War {
  id: string
  name: string
  startYear: number
  endYear?: number
  location: string
  belligerents: string[]
  result: string
  commanders: string[]
  description: string
}

export interface MapItem {
  id: string
  name: string
  year: number
  dynasty: string
  type: 'territory' | 'war' | 'trade' | 'migration'
  description: string
}

export interface Document {
  id: string
  title: string
  author: string
  year: number
  dynasty: string
  category: string
  content: string
  description: string
}
