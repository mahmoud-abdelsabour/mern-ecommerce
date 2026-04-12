import { createPortal } from "react-dom"
import { Toaster, Toast } from "@chakra-ui/react"
import { appToaster } from "../utils/appToaster"

const TOAST_REGION_MAX = "min(22rem, calc(100vw - 1.5rem))"

/**
 * Global toast region: portaled to `document.body` so position:fixed is never clipped
 * by app layout (flex, overflow, transforms). Width capped for small viewports.
 */
export const AppToaster = () => {
  if (typeof document === "undefined") return null

  return createPortal(
    <Toaster
      toaster={appToaster}
      zIndex={2000}
      style={{
        maxWidth: TOAST_REGION_MAX,
        width: TOAST_REGION_MAX,
        boxSizing: "border-box",
      }}
    >
      {(t) => (
        <Toast.Root
          w="100%"
          maxW="100%"
          minW={0}
          mx="auto"
          overflow="visible"
          pointerEvents="auto"
          shadow="md"
          rounded="md"
        >
          {t.title ? <Toast.Title>{t.title}</Toast.Title> : null}
          {t.description ? <Toast.Description>{t.description}</Toast.Description> : null}
          <Toast.CloseTrigger />
        </Toast.Root>
      )}
    </Toaster>,
    document.body
  )
}
