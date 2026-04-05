import { Box, Button, Field, Fieldset, Flex, HStack, Input, Stack, Text } from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { Link as RouterLink } from "react-router-dom"

const ChangePassword = () => {
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
    console.log("Change password", { oldPassword: "***", newPassword: "***" })
  }

  return (
    <Flex minH="70vh" align="center" justify="center" px={4} py={8}>
      <Box w="100%" maxW="520px">
        <Fieldset.Root size="lg">
          <Stack mb={4}>
            <Fieldset.Legend>Change Password</Fieldset.Legend>
            <Text fontSize="sm" color="gray.500">
              Enter your old password, then set a new one.
            </Text>
          </Stack>

          <Fieldset.Content as="form" onSubmit={onSubmit}>
            <Field.Root>
              <Field.Label>Old password</Field.Label>
              <Input
                type="password"
                value={form.oldPassword}
                onChange={(e) => setForm((p) => ({ ...p, oldPassword: e.target.value }))}
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>New password</Field.Label>
              <Input
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
              />
            </Field.Root>

            <Field.Root invalid={mismatch}>
              <Field.Label>Confirm new password</Field.Label>
              <Input
                type="password"
                value={form.confirmNewPassword}
                onChange={(e) => setForm((p) => ({ ...p, confirmNewPassword: e.target.value }))}
              />
              {mismatch && (
                <Text fontSize="xs" color="red.500" mt={1}>
                  Passwords do not match.
                </Text>
              )}
            </Field.Root>

            <HStack justify="space-between" flexWrap="wrap" gap={3}>
              <Button as={RouterLink} to="/me/edit" variant="outline">
                Back
              </Button>
              <Button type="submit" colorScheme="teal" disabled={!canSubmit}>
                Update password
              </Button>
            </HStack>
          </Fieldset.Content>
        </Fieldset.Root>
      </Box>
    </Flex>
  )
}

export default ChangePassword

