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
