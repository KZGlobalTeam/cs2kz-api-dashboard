export const apiBaseUrl = "http://127.0.0.1:42069"
export const steamApiUrl =
  "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2"

export interface Filter {
  id: number
  mode: "kz_classic" | "kz_vanilla"
  teleports: boolean
  tier: number
  ranked_status: "never" | "unranked" | "ranked"
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
