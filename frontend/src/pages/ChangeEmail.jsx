import { Box, Button, Field, Fieldset, Flex, HStack, Input, Stack, Text } from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { Link as RouterLink } from "react-router-dom"

const ChangeEmail = () => {
  const [form, setForm] = useState({
    newEmail: "",
    password: "",
  })

  const canSubmit = useMemo(() => {
    return String(form.newEmail).trim() && String(form.password).trim()
  }, [form])

  const onSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    console.log("Change email", { newEmail: form.newEmail, password: "***" })
  }

  return (
    <Flex minH="70vh" align="center" justify="center" px={4} py={8}>
      <Box w="100%" maxW="520px">
        <Fieldset.Root size="lg">
          <Stack mb={4}>
            <Fieldset.Legend>Change Email</Fieldset.Legend>
            <Text fontSize="sm" color="gray.500">
              Enter your password to confirm changing your email.
            </Text>
          </Stack>

          <Fieldset.Content as="form" onSubmit={onSubmit}>
            <Field.Root>
              <Field.Label>New email</Field.Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.newEmail}
                onChange={(e) => setForm((p) => ({ ...p, newEmail: e.target.value }))}
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Password</Field.Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
            </Field.Root>

            <HStack justify="space-between" flexWrap="wrap" gap={3}>
              <Button as={RouterLink} to="/me/edit" variant="outline">
                Back
              </Button>
              <Button type="submit" colorScheme="teal" disabled={!canSubmit}>
                Update email
              </Button>
            </HStack>
          </Fieldset.Content>
        </Fieldset.Root>
      </Box>
    </Flex>
  )
}

export default ChangeEmail

