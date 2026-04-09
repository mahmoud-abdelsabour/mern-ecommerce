import { Alert, Stack } from "@chakra-ui/react"

// Simple, reusable notification component.
// Use it anywhere you want a consistent Alert UI (error/info/warning/success).
const GlobalNotification = ({ status = "info", title }) => {
  if (!title) return null

  return (
    <Stack gap="4" width="full">
      <Alert.Root status={status}>
        <Alert.Indicator />
        <Alert.Title>{title}</Alert.Title>
      </Alert.Root>
    </Stack>
  )
}

export default GlobalNotification

