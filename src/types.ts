export const baseUrl = 'http://106.14.107.95:42069'

type Filter = {
  type: string,
  mode: string,
  // ranked: boolean,
  tier: number
}

export type Course = {
  filters: Filter[],
  // id: number,
  mappers: Mapper[],
  // stage: number
}

type Mapper = {
  name: string,
  steam_id: string
}

export type Map = {
  courses: Course[],
  created_on: string,
  filesize: number,
  id: number,
  mappers: Mapper[],
  name: string,
  updated_on: string,
  workshop_id: number
}