import {
  Avatar,
  Box,
  Button,
  FileUpload,
  Flex,
  HStack,
  Separator,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useEffect, useMemo } from "react"
import { HiUpload } from "react-icons/hi"
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom"
import { getToken } from "../APIs/http"
import { useMe } from "../hooks/useUser"
import GlobalNotification from "../components/GlobalNotification"

const Profile = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const FLASH_SECONDS = 5

  const token = getToken()
  const isLoggedIn = Boolean(token)

  // Fetch the authenticated user's actual profile from the backend.
  const { data: me, isLoading, isError, error } = useMe()

  // If the user is not logged in, redirect to login (protect /me route).
  useEffect(() => {
    if (!isLoggedIn) navigate("/login", { replace: true })
  }, [isLoggedIn, navigate])

  // One-time flash message (e.g. after updating profile/password/email).
  const flash = useMemo(() => location.state?.flash ?? null, [location.state])
  useEffect(() => {
    if (!flash) return
    // Clear the flash state after the notification has had time to display.
    const id = setTimeout(() => {
      navigate(location.pathname, { replace: true, state: null })
    }, FLASH_SECONDS * 1000)
    return () => clearTimeout(id)
  }, [FLASH_SECONDS, flash, location.pathname, navigate])

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

  const user = me ?? null
  const addresses = Array.isArray(user?.addresses) ? user.addresses : []

  return (
    <Box maxW="1200px" mx="auto" px={4} py={8} w="100%">
      <Stack gap={6}>
        <GlobalNotification
          status={flash?.status ?? "info"}
          title={flash?.title}
        />
        <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4} w="100%">
          <Stack gap={3}>
            <Text fontSize="lg" fontWeight="800">
              Profile
            </Text>
            <Separator />

            <HStack align="center" spacing={4} flexWrap="wrap">
              <Avatar.Root size="2xl">
                <Avatar.Fallback name={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`} />
                <Avatar.Image src={user?.profilePhoto ?? undefined} />
              </Avatar.Root>
              <Stack gap={0}>
                <Text fontSize="xl" fontWeight="900">
                  {user?.firstName ?? "—"} {user?.lastName ?? ""}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  @{user?.username ?? "—"}
                </Text>
              </Stack>
            </HStack>

            <Stack gap={1}>
              <Text fontSize="sm">
                Email:{" "}
                <Text as="span" fontWeight="800">
                  {user?.email ?? "—"}
                </Text>
              </Text>
              <Text fontSize="sm">
                Phone:{" "}
                <Text as="span" fontWeight="800">
                  {user?.phone ?? "—"}
                </Text>
              </Text>
            </Stack>

            <FileUpload.Root>
              <FileUpload.HiddenInput />
              <FileUpload.Trigger asChild>
                <Button variant="outline" size="sm" alignSelf="flex-start">
                  <HiUpload /> Upload photo
                </Button>
              </FileUpload.Trigger>
              <FileUpload.List />
            </FileUpload.Root>
          </Stack>
        </Box>

        <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4} w="100%">
          <Stack gap={3}>
            <HStack justify="space-between" align="center" flexWrap="wrap">
              <Text fontSize="lg" fontWeight="800">
                Saved Addresses
              </Text>
            </HStack>
            <Separator />

            {addresses.length === 0 ? (
              <Text fontSize="sm" color="gray.600">
                No saved addresses yet.
              </Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                {addresses.map((a) => (
                  <Box
                    key={a?._id ?? a?.id ?? a?.address_name ?? JSON.stringify(a)}
                    borderWidth="1px"
                    borderColor="gray.200"
                    rounded="md"
                    p={4}
                  >
                    <Stack gap={2}>
                      <Text fontSize="sm" fontWeight="900">
                        {a?.address_name ?? "Address"}
                      </Text>
                      <Text fontSize="sm" color="gray.700">
                        {a?.country ?? "—"}, {a?.city ?? "—"}, {a?.street ?? "—"}{" "}
                        {a?.building ?? "—"}, floor {a?.floor ?? "—"}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        Postal: {a?.postalcode ?? "—"}
                        {a?.special_mark ? ` • ${a.special_mark}` : ""}
                      </Text>
                    </Stack>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </Stack>
        </Box>

        <HStack justify="flex-end">
          <Button as={RouterLink} to="/me/edit" variant="outline">
            Edit profile
          </Button>
        </HStack>
      </Stack>
    </Box>
  )
}

export default Profile
