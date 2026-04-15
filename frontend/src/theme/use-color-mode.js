import { useContext } from "react"
import { ColorModeContext } from "./color-mode-context"

export const useColorMode = () => useContext(ColorModeContext)

export const useColorModeValue = (lightValue, darkValue) => {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? darkValue : lightValue
}
