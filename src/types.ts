export const baseUrl = "http://106.14.107.95:42069"

interface Filter {
  ranked: boolean,
  mode: string
  teleports: boolean
  tier: number
}

export interface Course {
  id: number
  filters: Filter[]
  mappers: Mapper[]
  stage: number
}

export interface Mapper {
  name: string
  steam_id: string
}

export interface Map {
  id: number
  name: string
  filesize: number
  workshop_id: number
  courses: Course[]
  mappers: Mapper[]
  created_on: string
  updated_on: string
}
