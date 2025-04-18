import { defineStore } from "pinia"
import { Game } from "../types"

export const useGameStore = defineStore("game", {
  state: () => ({
    game: "cs2" as Game,
  }),
})
