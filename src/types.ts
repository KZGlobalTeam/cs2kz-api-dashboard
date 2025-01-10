export type Tier =
  | "very-easy"
  | "easy"
  | "medium"
  | "advanced"
  | "hard"
  | "very-hard"
  | "extreme"
  | "death"
  | "unfeasible"
  | "impossible"

export type Mode = "classic" | "vanilla"

export type MapState = "approved" | "invalid" | "in-testing"

export type FilterState = "pending" | "unranked" | "ranked"

export type Permission = "map-pool" | "servers" | "player-bans" | "user-permissions"

export type BanReason = "macro" | "auto_strafe" | "auto_bhop"

export interface Player {
  name: string
  id: string
}

export interface CourseFilter {
  nub_tier: Tier
  pro_tier: Tier
  state: FilterState
  notes: string
}

export interface CourseFilters {
  vanilla: CourseFilter
  classic: CourseFilter
}

export interface FilterUpdate {
  vanilla?: Partial<CourseFilter>
  classic?: Partial<CourseFilter>
}

export interface Course {
  name: string
  description?: string
  filters: CourseFilters
  mappers: Player[]
}

export interface NewCourse {
  name: string
  description?: string
  filters: CourseFilters
  mappers: string[]
}

export interface CourseUpdate {
  idx: number
  name?: string
  description?: string
  added_mappers: string[]
  deleted_mappers: string[]
  filter_updates: FilterUpdate
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
  approved_at: string
}

export interface NewMap {
  workshop_id: string
  description?: string
  state: MapState
  mappers: string[]
  courses: NewCourse[]
}

export interface MapUpdate {
  workshop_id?: number
  description?: string
  state?: MapState
  added_mappers?: string[]
  deleted_mappers?: string[]
  course_updates?: CourseUpdate[]
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
  banned_by: BannedBy
  created_at: string
  unban?: Unban
}

export interface BannedBy {
  id: number
  type: "server" | "admin"
}

export interface Unban {
  admin_id: number
  reason: string
  created_at: string
}
