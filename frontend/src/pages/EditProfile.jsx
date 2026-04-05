import { Box, Button, Field, Fieldset, Flex, HStack, Input, Stack, Text } from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { Link as RouterLink } from "react-router-dom"

const EditProfile = () => {
  const [form, setForm] = useState({
    firstName: "Mahmoud",
    lastName: "Ahmed",
    username: "mahmoud",
    email: "mahmoud@example.com",
    phone: "+20 100 000 0000",
  })

  const canSave = useMemo(() => {
    return (
      String(form.firstName).trim() &&
      String(form.lastName).trim() &&
      String(form.username).trim() &&
      String(form.email).trim() &&
      String(form.phone).trim()
    )
  }, [form])

  const onSubmit = (e) => {
    e.preventDefault()
    if (!canSave) return
    console.log("Update profile", form)
  }

  return (
    <Flex minH="70vh" align="center" justify="center" px={4} py={8}>
      <Box w="100%" maxW="520px">
        <Fieldset.Root size="lg">
          <Stack mb={4}>
            <Fieldset.Legend>Edit Profile</Fieldset.Legend>
            <Text fontSize="sm" color="gray.500">
              Update your personal information.
            </Text>
          </Stack>

          <Fieldset.Content as="form" onSubmit={onSubmit}>
            <HStack gap={3} flexWrap="wrap">
              <Field.Root flex="1" minW="220px">
                <Field.Label>First name</Field.Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                />
              </Field.Root>
              <Field.Root flex="1" minW="220px">
                <Field.Label>Last name</Field.Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                />
              </Field.Root>
            </HStack>

            <Field.Root>
              <Field.Label>Username</Field.Label>
              <Input
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Email</Field.Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Phone</Field.Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
            </Field.Root>

            <HStack justify="space-between" flexWrap="wrap" gap={3}>
              <HStack flexWrap="wrap" gap={2}>
                <Button as={RouterLink} to="/me/change-password" variant="outline">
                  Change password
                </Button>
                <Button as={RouterLink} to="/me/change-email" variant="outline">
                  Change email
                </Button>
              </HStack>
              <HStack>
                <Button as={RouterLink} to="/me" variant="outline">
                  Back
                </Button>
                <Button type="submit" disabled={!canSave}>
                  Save
                </Button>
              </HStack>
            </HStack>
          </Fieldset.Content>
        </Fieldset.Root>
      </Box>
    </Flex>
  )
}

export default EditProfile
