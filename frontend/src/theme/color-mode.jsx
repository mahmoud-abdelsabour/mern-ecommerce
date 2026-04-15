import { useMemo } from "react"
import { ThemeProvider, useTheme } from "next-themes"
import { ColorModeContext } from "./color-mode-context"

export const ColorModeProvider = ({ children }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="mern-ecommerce-color-mode"
    >
      <ColorModeBridge>{children}</ColorModeBridge>
    </ThemeProvider>
  )
}

const ColorModeBridge = ({ children }) => {
  const { resolvedTheme, setTheme } = useTheme()

  const value = useMemo(() => {
    const colorMode = resolvedTheme === "dark" ? "dark" : "light"

    return {
      colorMode,
      setColorMode: (mode) => setTheme(mode),
      toggleColorMode: () => setTheme(colorMode === "dark" ? "light" : "dark"),
    }
  }, [resolvedTheme, setTheme])

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>
}
