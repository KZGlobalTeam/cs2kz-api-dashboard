export const apiBaseUrl = "http://127.0.0.1:42069"
// export const apiBaseUrl = "http://106.14.107.95:42069"
export const steamApiUrl =
  "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2"

export type Tier =
  | "very_easy"
  | "easy"
  | "medium"
  | "advanced"
  | "hard"
  | "very_hard"
  | "extreme"
  | "death"
  | "unfeasible"
  | "impossible"
  
export type Mode = "classic" | "vanilla"

export type RankedStatus = "never" | "unranked" | "ranked"

export type GlobalStatus = "global" | "not_global" | "in_testing"

export interface Filter {
  id: number
  mode: Mode
  teleports: boolean
  tier: Tier
  ranked_status: RankedStatus
}

export interface Course {
  id: number
  name?: string
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
  global_status: GlobalStatus
  checksum: number
  workshop_id: number
  courses: Course[]
  mappers: Mapper[]
  created_on: string
}
