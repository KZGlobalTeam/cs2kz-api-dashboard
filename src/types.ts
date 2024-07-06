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

export type Permission = "none" | "maps" | "servers" | "bans" | "admin"

export type BanReason = "auto_strafe" | "auto_bhop"

export interface Player {
  name: string
  steam_id: string
  ip_address?: string
  is_banned: boolean
}

export interface Filter {
  id: number
  mode: Mode
  teleports: boolean
  tier: Tier
  ranked_status: RankedStatus
  notes?: string
}

export interface Course {
  id: number
  name?: string
  description?: string
  filters: Filter[]
  mappers: Player[]
}

export interface Map {
  id: number
  name: string
  description?: string
  global_status: GlobalStatus
  checksum: number
  workshop_id: number
  courses: Course[]
  mappers: Player[]
  created_on: string
}

export interface Admin {
  name: string
  steam_id: string
  permissions: Permission[]
}

export interface Server {
  id: number
  name: string
  ip_address: string
  owner: Player
  created_on: string
}

export interface Ban {
  id: number
  player: Player
  reason: BanReason
  server?: Server
  admin?: Player
  created_on: string
  expires_on?: string
  unban?: Unban
}

export interface Unban {
  id: number
  reason: string
  admin?: Player
  created_on: string
}
