import type { paths, components } from "../openapi-types"

export type Game = components["schemas"]["Game"]

export type User = components["schemas"]["User"]

export type Mapper = components["schemas"]["Mapper"]

export type Map = components["schemas"]["Map"]

export type Courses = Map["courses"]

export type Mappers = Courses[number]["mappers"]

export type NewMap = components["schemas"]["CreateMapRequest"]

export type MapUpdate = components["schemas"]["UpdateMapRequest"]

export type NewCourses = paths["/maps"]["put"]["requestBody"]["content"]["application/json"]["courses"]

export type NewFilters = NewCourses[number]["filters"]

export type NewCS2Filters = Extract<NewFilters, { ckz: any }>

export type NewCSGOFilters = Extract<NewFilters, { kzt: any }>

export type NewFilter = components["schemas"]["CreateFilterRequest"]

export type MapState = components["schemas"]["MapState"]

export type Server = components["schemas"]["Server"]

export type NewServer = components["schemas"]["CreateServerRequest"]

export type Ban = components["schemas"]["Ban"]

export type Permission = components["schemas"]["Permission"]
