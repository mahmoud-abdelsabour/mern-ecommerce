import { Box, Button, Field, Fieldset, Flex, HStack, Input, Stack, Text } from "@chakra-ui/react"
import { useEffect, useMemo, useState } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import GlobalNotification from "../components/GlobalNotification"
import { getToken } from "../APIs/http"
import { useMe, useUpdateProfile } from "../hooks/useUser"
import { setFlash } from "../utils/flashStorage"

const EditProfileForm = ({ initialForm }) => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: initialForm.firstName,
    lastName: initialForm.lastName,
    username: initialForm.username,
    phone: initialForm.phone,
  })

  const canSave = useMemo(() => {
    return (
      String(form.firstName).trim() &&
      String(form.lastName).trim() &&
      String(form.username).trim() &&
      String(form.phone).trim()
    )
  }, [form])

  const updateProfileMutation = useUpdateProfile({
    onSuccess: () => {
      // After updating, navigate back to profile and show a success notification there.
      setFlash({ status: "success", title: "Profile updated successfully." })
      navigate("/me", {
        replace: true,
      })
    },
  })

  const onSubmit = (e) => {
    e.preventDefault()
    if (!canSave) return
    updateProfileMutation.mutate({
      firstName: String(form.firstName ?? "").trim(),
      lastName: String(form.lastName ?? "").trim(),
      username: String(form.username ?? "").trim(),
      phone: String(form.phone ?? "").trim(),
    })
  }

  return (
    <Flex minH="70vh" align="center" justify="center" px={4} py={8}>
      <Box as="form" onSubmit={onSubmit} w="100%" maxW="520px">
        <Fieldset.Root size="lg">
          <Stack mb={4}>
            <Fieldset.Legend>Edit Profile</Fieldset.Legend>
            <Text fontSize="sm" color="gray.500">
              Update your personal information.
            </Text>
          </Stack>

          <Fieldset.Content>
            <GlobalNotification
              status="error"
              title={
                updateProfileMutation.isError
                  ? updateProfileMutation.error?.response?.data?.message ??
                    updateProfileMutation.error?.message ??
                    "Failed to update profile"
                  : null
              }
            />
            <HStack gap={3} flexWrap="wrap">
              <Field.Root flex="1" minW="220px">
                <Field.Label>First name</Field.Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                  disabled={updateProfileMutation.isPending}
                />
              </Field.Root>
              <Field.Root flex="1" minW="220px">
                <Field.Label>Last name</Field.Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                  disabled={updateProfileMutation.isPending}
                />
              </Field.Root>
            </HStack>

            <Field.Root>
              <Field.Label>Username</Field.Label>
              <Input
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                disabled={updateProfileMutation.isPending}
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Phone</Field.Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                disabled={updateProfileMutation.isPending}
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
                <Button type="submit" disabled={!canSave || updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </HStack>
            </HStack>
          </Fieldset.Content>
        </Fieldset.Root>
      </Box>
    </Flex>
  )
}

const EditProfile = () => {
  const navigate = useNavigate()
  const token = getToken()
  const isLoggedIn = Boolean(token)

  // Load current profile data to prefill the form.
  const { data: me, isLoading, isError, error } = useMe()

  // Protect route: redirect to login if not authenticated.
  useEffect(() => {
    if (!isLoggedIn) navigate("/login", { replace: true })
  }, [isLoggedIn, navigate])

  if (!isLoggedIn) return null

  if (isLoading) {
    return (
      <Flex minH="50vh" align="center" justify="center" px={4}>
        <Text color="gray.500">Loading profile...</Text>
      </Flex>
    )
  }

  if (isError) {
    return (
      <Flex minH="50vh" align="center" justify="center" px={4}>
        <Text color="red.500" fontSize="sm">
          Failed to load profile: {error?.response?.data?.message ?? error?.message ?? "Unknown error"}
        </Text>
      </Flex>
    )
  }

  const initialForm = {
    firstName: me?.firstName ?? "",
    lastName: me?.lastName ?? "",
    username: me?.username ?? "",
    phone: me?.phone ?? "",
  }

  // Use a keyed child to reset form state when user data changes without setState-in-effect.
  const key = me?.id ?? me?._id ?? "me"

  return <EditProfileForm key={key} initialForm={initialForm} />
}

export default EditProfile
