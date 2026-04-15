import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#ecfdf5" },
          100: { value: "#d1fae5" },
          200: { value: "#a7f3d0" },
          300: { value: "#6ee7b7" },
          400: { value: "#34d399" },
          500: { value: "#10b981" },
          600: { value: "#059669" },
          700: { value: "#047857" },
          800: { value: "#065f46" },
          900: { value: "#064e3b" },
        },
        accent: {
          50: { value: "#eff6ff" },
          100: { value: "#dbeafe" },
          200: { value: "#bfdbfe" },
          300: { value: "#93c5fd" },
          400: { value: "#60a5fa" },
          500: { value: "#3b82f6" },
          600: { value: "#2563eb" },
          700: { value: "#1d4ed8" },
          800: { value: "#1e40af" },
          900: { value: "#1e3a8a" },
        },
        neutral: {
          50: { value: "#f8fafc" },
          100: { value: "#f1f5f9" },
          200: { value: "#e2e8f0" },
          300: { value: "#cbd5e1" },
          400: { value: "#94a3b8" },
          500: { value: "#64748b" },
          600: { value: "#475569" },
          700: { value: "#334155" },
          800: { value: "#1e293b" },
          900: { value: "#0f172a" },
        },
      },
    },
    semanticTokens: {
      colors: {
        "surface.canvas": { value: { _light: "{colors.neutral.50}", _dark: "{colors.neutral.950}" } },
        "surface.panel": { value: { _light: "white", _dark: "{colors.neutral.900}" } },
        "surface.elevated": { value: { _light: "white", _dark: "{colors.neutral.800}" } },
        "surface.subtle": { value: { _light: "{colors.neutral.100}", _dark: "{colors.neutral.800}" } },
        "surface.border": { value: { _light: "{colors.neutral.200}", _dark: "{colors.neutral.700}" } },
        "text.primary": { value: { _light: "{colors.neutral.900}", _dark: "{colors.neutral.50}" } },
        "text.secondary": { value: { _light: "{colors.neutral.600}", _dark: "{colors.neutral.300}" } },
        "text.muted": { value: { _light: "{colors.neutral.500}", _dark: "{colors.neutral.400}" } },
        "text.subtle": { value: { _light: "{colors.neutral.600}", _dark: "{colors.neutral.300}" } },
        "state.success": { value: { _light: "#15803d", _dark: "#4ade80" } },
        "state.error": { value: { _light: "#b91c1c", _dark: "#f87171" } },
        "state.warning": { value: { _light: "#b45309", _dark: "#fbbf24" } },
        "state.info": { value: { _light: "{colors.accent.700}", _dark: "{colors.accent.300}" } },
      },
    },
  },
})

export const appSystem = createSystem(defaultConfig, config)
