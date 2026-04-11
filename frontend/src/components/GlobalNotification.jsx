import { Alert, Stack } from "@chakra-ui/react"
import { keyframes } from "@emotion/react"

// Simple, reusable notification component.
// Use it anywhere you want a consistent Alert UI (error/info/warning/success).
const DISPLAY_SECONDS = 5
const FADE_OUT_MS = 200

const GlobalNotification = ({ status = "info", title }) => {
  if (!title) return null

  // CSS-only auto-hide so we avoid state management inside effects.
  // The notification stays visible for ~5 seconds, then collapses/fades out.
  const fadeOut = keyframes`
    to {
      opacity: 0;
      transform: translateY(-2px);
    }
  `

  const collapse = keyframes`
    to {
      max-height: 0;
      padding-top: 0;
      padding-bottom: 0;
      margin-top: 0;
      margin-bottom: 0;
    }
  `

  const fadeDelaySeconds = Math.max(0, DISPLAY_SECONDS - FADE_OUT_MS / 1000)
  const wrapperAnimation = `${fadeOut} ${FADE_OUT_MS}ms ease ${fadeDelaySeconds}s forwards, ${collapse} ${FADE_OUT_MS}ms ease ${fadeDelaySeconds}s forwards`

  return (
    <Stack
      gap="4"
      width="full"
      overflow="hidden"
      maxH="200px"
      animation={wrapperAnimation}
    >
      <Alert.Root status={status}>
        <Alert.Indicator />
        <Alert.Title>{title}</Alert.Title>
      </Alert.Root>
    </Stack>
  )
}

export default GlobalNotification
