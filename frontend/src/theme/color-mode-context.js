import { createContext } from "react"

export const ColorModeContext = createContext({
  colorMode: "light",
  setColorMode: () => {},
  toggleColorMode: () => {},
})
