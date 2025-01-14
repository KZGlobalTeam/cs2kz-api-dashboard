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
  const { data } = error.response
  return `${data.title}\n${data.json_error ? data.json_error.detail : data.detail}`
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
