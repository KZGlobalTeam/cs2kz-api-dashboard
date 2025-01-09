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

export type FilterState = "pending" | "unranked" | "ranked"

export type MapState = "global" | "invalid" | "in_testing"

export type Permission =
  | "map-pool"
  | "servers"
  | "player-bans"
  | "user-permissions"

export type BanReason = "macro" | "auto_strafe" | "auto_bhop"

export interface Player {
  name: string
  id: string
}

export interface Filters {
  vanilla: Filter
  classic: Filter
}

export interface Filter {
  nub_tier: Tier
  pro_tier: Tier
  state: FilterState
  notes: string
}

export interface Course {
  name: string
  description?: string
  filters: Filters
  mappers: Player[]
}

export interface Map {
  id: number
  workshop_id: number
  name: string
  description?: string
  state: MapState
  vpk_checksum: number
  mappers: Player[]
  courses: Course[]
  aproved_at: string
}

export interface User {
  id: string
  name: string
  permissions: Permission[]
  registered_at: string
}

export interface Server {
  id: number
  name: string
  host: string
  port: number
  owner: Player
  approved_at: string
}

export interface Ban {
  id: number
  player: Player
  reason: BanReason
  banned_by: Player
  created_at: string
  unban?: Unban
}

export interface Unban {
  admin_id: number
  reason: string
  created_at: string
}
