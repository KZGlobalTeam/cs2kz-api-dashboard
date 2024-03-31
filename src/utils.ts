import { format } from "date-fns"
import { h } from "vue"
import SteamID from "steamid"

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
    }
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
    }
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

export function getDiff(obj1: Record<string, any>, obj2: Record<string, any>) {
  const diffObj: Record<string, any> = {}

  for (const prop in obj1) {
    if (obj1.hasOwnProperty(prop) && obj2.hasOwnProperty(prop)) {
      if (
        typeof obj1[prop] === "object" &&
        typeof obj2[prop] === "object" &&
        obj1[prop] !== null &&
        obj2[prop] !== null
      ) {
        const nestedDiff = getDiff(obj1[prop], obj2[prop])
        if (Object.keys(nestedDiff).length > 0) {
          diffObj[prop] = nestedDiff
        }
      } else if (obj1[prop] !== obj2[prop]) {
        diffObj[prop] = obj2[prop]
      }
    }
  }

  return diffObj
}
