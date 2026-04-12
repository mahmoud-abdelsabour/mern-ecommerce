import { createToaster } from "@chakra-ui/react"

// Single app-wide toast store (Chakra v3 + Ark).
// Symmetric horizontal insets keep toasts inside the viewport on narrow screens; top clears sticky nav.
export const appToaster = createToaster({
  placement: "top-end",
  max: 5,
  pauseOnPageIdle: true,
  offsets: {
    top: "max(4.5rem, env(safe-area-inset-top, 0px))",
    right: "max(0.75rem, env(safe-area-inset-right, 0px))",
    bottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
    left: "max(0.75rem, env(safe-area-inset-left, 0px))",
  },
})
