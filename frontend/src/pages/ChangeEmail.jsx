import { Box, Button, Field, Fieldset, Flex, HStack, Input, Stack, Text } from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { useUpdateProfile } from "../hooks/useUser"
import { clearStoredUser } from "../utils/authStorage"
import { setFlash } from "../utils/flashStorage"

const ChangeEmail = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    newEmail: "",
  })

  const canSubmit = useMemo(() => {
    return String(form.newEmail).trim()
  }, [form])

  const updateProfileMutation = useUpdateProfile({
    onSuccess: () => {
      // Backend increments `tokenVersion` when email changes, which invalidates the current JWT.
      // Log out and force re-login so the user gets a fresh token.
      clearStoredUser()
      setFlash({ status: "success", title: "Email updated successfully." })
      navigate("/login", { replace: true })
    },
  })

  const onSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    updateProfileMutation.mutate({ email: String(form.newEmail ?? "").trim() })
  }

  return (
    <Flex minH="70vh" align="center" justify="center" px={4} py={8}>
      <Box as="form" onSubmit={onSubmit} w="100%" maxW="520px">
        <Fieldset.Root size="lg" borderWidth="1px" borderColor="surface.border" bg="surface.panel" rounded="lg" p={{ base: 4, md: 6 }}>
          <Stack mb={4}>
            <Fieldset.Legend>Change Email</Fieldset.Legend>
            <Text fontSize="sm" color="text.secondary">
              Enter your new email address. You will be signed out after saving.
            </Text>
          </Stack>

          <Fieldset.Content gap={4}>
            <Field.Root>
              <Field.Label>New email</Field.Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.newEmail}
                onChange={(e) => setForm((p) => ({ ...p, newEmail: e.target.value }))}
                disabled={updateProfileMutation.isPending}
              />
            </Field.Root>

            <HStack justify="space-between" flexWrap="wrap" gap={3}>
              <Button as={RouterLink} to="/me/edit" variant="outline" colorPalette="neutral">
                Back
              </Button>
              <Button
                type="submit"
                colorPalette="brand"
                disabled={!canSubmit || updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Updating..." : "Update email"}
              </Button>
            </HStack>
          </Fieldset.Content>
        </Fieldset.Root>
      </Box>
    </Flex>
  )
}

export default ChangeEmail
