import { format } from "date-fns"
import { h } from "vue"
import SteamID from "steamid"
import { Ban } from "./types"

export function toLocal(date: string) {
  return format(new Date(date), "yyyy-MM-dd HH:mm:ss")
}

export function renderSteamID(steamId: string, isBanned?: boolean) {
  const steamId64 = new SteamID(steamId).toString()
  return h(
    "a",
    {
      href: `https://steamcommunity.com/profiles/${steamId64}`,
      target: "_blank",
      rel: "noopener noreferrer",
      class: isBanned
        ? "border-b border-red-400 text-red-400"
        : "border-b border-green-400 text-green-400",
    },
    {
      default: () => steamId,
    },
  )
}

export function renderWorkshopId(workshopId: number) {
  return h(
    "a",
    {
      href: `https://steamcommunity.com/sharedfiles/filedetails/?id=${workshopId}`,
      target: "_blank",
      rel: "noopener noreferrer",
      class: "border-b border-blue-400 text-blue-400",
    },
    {
      default: () => workshopId,
    },
  )
}

export function toErrorMsg(error: any) {
  if (typeof error.response.data !== "object") {
    return `${error.response.data}`
  }

  if (error.response.data.debug_info) {
    return `${error.response.data.debug_info}, ${error.response.data.message}`
  }

  return `${error.response.data.message}`
}

export function getDiff(obj1: any, obj2: any) {
  const diff: any = {}

  for (const prop in obj1) {
    if (obj1.hasOwnProperty(prop) && obj2.hasOwnProperty(prop)) {
      if (obj1[prop] !== obj2[prop]) {
        diff[prop] = obj2[prop]
      }
    }
  }

  return diff
}

export function transformSrv(server: any) {
  const lastColonIdx = server.ip_address.lastIndexOf(":")
  const host = server.ip_address.slice(0, lastColonIdx)
  const port = server.ip_address.slice(lastColonIdx + 1)
  return {
    new_name: server.name,
    new_host: host,
    new_port: parseInt(port),
    new_owner: server.owner,
  }
}

export function calcBanDuration(ban: Ban) {
  const createdDate = new Date(ban.created_on)
  if (!ban.expires_on) {
    return "permanent"
  }
  const expiresDate = new Date(ban.expires_on)

  const diffInMs = expiresDate.getTime() - createdDate.getTime()

  const diffInDays = diffInMs / (1000 * 60 * 60 * 24)

  return Math.round(diffInDays)
}
