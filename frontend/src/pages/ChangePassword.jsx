import { Box, Button, Field, Fieldset, Flex, HStack, Input, Stack, Text } from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { getStoredUser } from "../utils/authStorage"
import { useUpdatePassword } from "../hooks/useAuth"
import { clearStoredUser } from "../utils/authStorage"
import { setFlash } from "../utils/flashStorage"

const ChangePassword = () => {
  const navigate = useNavigate()
  const storedUser = getStoredUser()
  const userId = storedUser?.id ?? storedUser?._id ?? null

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })

  const mismatch = useMemo(() => {
    return (
      String(form.newPassword) &&
      String(form.confirmNewPassword) &&
      form.newPassword !== form.confirmNewPassword
    )
  }, [form])

  const canSubmit = useMemo(() => {
    return (
      String(form.oldPassword).trim() &&
      String(form.newPassword).trim() &&
      String(form.confirmNewPassword).trim() &&
      !mismatch
    )
  }, [form, mismatch])

  const onSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    if (!userId) return

    updatePasswordMutation.mutate({
      userId,
      currentPassword: String(form.oldPassword ?? ""),
      newPassword: String(form.newPassword ?? ""),
    })
  }

  const updatePasswordMutation = useUpdatePassword({
    onSuccess: () => {
      clearStoredUser()
      setFlash({ status: "success", title: "Password updated successfully." })
      navigate("/login", {
        replace: true,
      })
    },
  })

  return (
    <Flex minH="70vh" align="center" justify="center" px={4} py={8}>
      <Box as="form" onSubmit={onSubmit} w="100%" maxW="520px">
        <Fieldset.Root size="lg" borderWidth="1px" borderColor="surface.border" bg="surface.panel" rounded="lg" p={{ base: 4, md: 6 }}>
          <Stack mb={4}>
            <Fieldset.Legend>Change Password</Fieldset.Legend>
            <Text fontSize="sm" color="text.secondary">
              Enter your old password, then set a new one.
            </Text>
          </Stack>

          <Fieldset.Content gap={4}>
            <Field.Root>
              <Field.Label>Old password</Field.Label>
              <Input
                type="password"
                value={form.oldPassword}
                onChange={(e) => setForm((p) => ({ ...p, oldPassword: e.target.value }))}
                disabled={updatePasswordMutation.isPending}
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>New password</Field.Label>
              <Input
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
                disabled={updatePasswordMutation.isPending}
              />
            </Field.Root>

            <Field.Root invalid={mismatch}>
              <Field.Label>Confirm new password</Field.Label>
              <Input
                type="password"
                value={form.confirmNewPassword}
                onChange={(e) => setForm((p) => ({ ...p, confirmNewPassword: e.target.value }))}
                disabled={updatePasswordMutation.isPending}
              />
              {mismatch && (
                <Text fontSize="xs" color="state.error" mt={1}>
                  Passwords do not match.
                </Text>
              )}
            </Field.Root>

            <HStack justify="space-between" flexWrap="wrap" gap={3}>
              <Button as={RouterLink} to="/me/edit" variant="outline" colorPalette="neutral">
                Back
              </Button>
              <Button
                type="submit"
                colorPalette="brand"
                disabled={!canSubmit || updatePasswordMutation.isPending || !userId}
              >
                {updatePasswordMutation.isPending ? "Updating..." : "Update password"}
              </Button>
            </HStack>
          </Fieldset.Content>
        </Fieldset.Root>
      </Box>
    </Flex>
  )
}

export default ChangePassword
