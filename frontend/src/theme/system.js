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
        "surface.canvas": { value: "{colors.neutral.50}" },
        "surface.panel": { value: "white" },
        "surface.subtle": { value: "{colors.neutral.100}" },
        "surface.border": { value: "{colors.neutral.200}" },
        "text.primary": { value: "{colors.neutral.900}" },
        "text.secondary": { value: "{colors.neutral.600}" },
        "text.muted": { value: "{colors.neutral.500}" },
        "state.success": { value: "#15803d" },
        "state.error": { value: "#b91c1c" },
        "state.warning": { value: "#b45309" },
        "state.info": { value: "{colors.accent.700}" },
      },
    },
  },
})

export const appSystem = createSystem(defaultConfig, config)
