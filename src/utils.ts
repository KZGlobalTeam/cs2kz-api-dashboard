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
      class: isBanned ? "border-b border-red-400 text-red-400" : "border-b border-green-400 text-green-400",
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
  return `${error.response.data.title}\n${error.response.data.json_error.detail}`
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
  const [host, port] = server.ip_address.split(":")
  return {
    name: server.name,
    host,
    port: parseInt(port),
    owner_id: server.owner,
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
