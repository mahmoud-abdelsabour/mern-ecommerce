import { Avatar, Box, Button, FileUpload, HStack, IconButton, Separator, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { LuPencil, LuPlus, LuTrash2 } from "react-icons/lu"
import { HiUpload } from "react-icons/hi"
import AddressForm from "../components/AddressForm"

const emptyDraft = {
  firstName: "",
  lastName: "",
  phone: "",
  country: "",
  city: "",
  postalcode: "",
  street: "",
  building: "",
  floor: "",
  special_mark: "",
}

const toDraft = (addr) => ({
  firstName: addr?.firstName ?? "",
  lastName: addr?.lastName ?? "",
  phone: addr?.phone ?? "",
  country: addr?.address?.country ?? "",
  city: addr?.address?.city ?? "",
  postalcode: addr?.address?.postalcode ?? "",
  street: addr?.address?.street ?? "",
  building: addr?.address?.building ?? "",
  floor: addr?.address?.floor ?? "",
  special_mark: addr?.address?.special_mark ?? "",
})

const toAddress = (id, draft) => ({
  id,
  firstName: draft.firstName.trim(),
  lastName: draft.lastName.trim(),
  phone: draft.phone.trim(),
  address: {
    country: draft.country.trim(),
    city: draft.city.trim(),
    postalcode: draft.postalcode.trim(),
    street: draft.street.trim(),
    building: draft.building.trim(),
    floor: Number(draft.floor),
    special_mark: draft.special_mark.trim(),
  },
})

const requiredKeys = [
  "firstName",
  "lastName",
  "phone",
  "country",
  "city",
  "postalcode",
  "street",
  "building",
  "floor",
]

const Profile = () => {
  const user = {
    firstName: "Mahmoud",
    lastName: "Ahmed",
    username: "mahmoud",
    email: "mahmoud@example.com",
    phone: "+20 100 000 0000",
    avatarUrl: "https://example.com",
  }

  const [addresses, setAddresses] = useState([
    {
      id: "addr-1",
      firstName: "Mahmoud",
      lastName: "Ahmed",
      phone: "+20 100 000 0000",
      address: {
        country: "Egypt",
        city: "Cairo",
        postalcode: "11311",
        street: "Tahrir St.",
        building: "12B",
        floor: 3,
        special_mark: "Near the metro station",
      },
    },
  ])

  const [formMode, setFormMode] = useState("hidden") // hidden | create | edit
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(emptyDraft)

  const updateDraft = (patch) => setDraft((prev) => ({ ...prev, ...patch }))

  const canSubmit = useMemo(() => {
    return !requiredKeys.some((k) => String(draft[k] ?? "").trim() === "")
  }, [draft])

  const onAdd = () => {
    setEditingId(null)
    setDraft(emptyDraft)
    setFormMode("create")
  }

  const onEdit = (id) => {
    const existing = addresses.find((a) => a.id === id)
    if (!existing) return
    setEditingId(id)
    setDraft(toDraft(existing))
    setFormMode("edit")
  }

  const onDelete = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setDraft(emptyDraft)
      setFormMode("hidden")
    }
  }

  const onCancelForm = () => {
    setEditingId(null)
    setDraft(emptyDraft)
    setFormMode("hidden")
  }

  const onSubmit = () => {
    if (!canSubmit) return

    if (formMode === "create") {
      const id = `addr-${Date.now()}`
      setAddresses((prev) => [...prev, toAddress(id, draft)])
      onCancelForm()
      return
    }

    if (formMode === "edit" && editingId) {
      setAddresses((prev) => prev.map((a) => (a.id === editingId ? toAddress(editingId, draft) : a)))
      onCancelForm()
    }
  }

  return (
    <Box maxW="1200px" mx="auto" px={4} py={8} w="100%">
      <Stack gap={6}>
        <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4} w="100%">
          <Stack gap={3}>
            <Text fontSize="lg" fontWeight="800">
              Profile
            </Text>
            <Separator />

            <HStack align="center" spacing={4} flexWrap="wrap">
              <Avatar.Root size="2xl">
                <Avatar.Fallback name={`${user.firstName} ${user.lastName}`} />
                <Avatar.Image src={user.avatarUrl} />
              </Avatar.Root>
              <Stack gap={0}>
                <Text fontSize="xl" fontWeight="900">
                  {user.firstName} {user.lastName}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  @{user.username}
                </Text>
              </Stack>
            </HStack>

            <Stack gap={1}>
              <Text fontSize="sm">
                Email:{" "}
                <Text as="span" fontWeight="800">
                  {user.email}
                </Text>
              </Text>
              <Text fontSize="sm">
                Phone:{" "}
                <Text as="span" fontWeight="800">
                  {user.phone}
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
              <IconButton aria-label="Add address" size="sm" variant="outline" onClick={onAdd}>
                <LuPlus />
              </IconButton>
            </HStack>
            <Separator />

            {addresses.length === 0 ? (
              <Text fontSize="sm" color="gray.600">
                No saved addresses yet. Click + to add one.
              </Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                {addresses.map((a) => (
                  <Box key={a.id} borderWidth="1px" borderColor="gray.200" rounded="md" p={4}>
                    <Stack gap={2}>
                      <HStack justify="space-between" align="start">
                        <Stack gap={0}>
                          <Text fontSize="sm" fontWeight="900">
                            {a.firstName} {a.lastName}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {a.phone}
                          </Text>
                        </Stack>
                        <HStack>
                          <IconButton
                            aria-label="Edit address"
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(a.id)}
                          >
                            <LuPencil />
                          </IconButton>
                          <IconButton
                            aria-label="Delete address"
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            onClick={() => onDelete(a.id)}
                          >
                            <LuTrash2 />
                          </IconButton>
                        </HStack>
                      </HStack>

                      <Text fontSize="sm" color="gray.700">
                        {a.address.country}, {a.address.city}, {a.address.street} {a.address.building},
                        floor {a.address.floor}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        Postal: {a.address.postalcode}
                        {a.address.special_mark ? ` • ${a.address.special_mark}` : ""}
                      </Text>
                    </Stack>
                  </Box>
                ))}
              </SimpleGrid>
            )}

            {formMode !== "hidden" && (
              <Stack gap={2}>
                <Separator />
                <AddressForm
                  title={formMode === "edit" ? "Update Address" : "Add New Address"}
                  draft={draft}
                  onChange={updateDraft}
                  onSubmit={onSubmit}
                  submitLabel={formMode === "edit" ? "Update address" : "Save address"}
                  onCancel={onCancelForm}
                />
                {!canSubmit && (
                  <Text fontSize="xs" color="gray.500">
                    Fill all required fields to {formMode === "edit" ? "update" : "save"} the address.
                  </Text>
                )}
              </Stack>
            )}
          </Stack>
        </Box>

        <HStack justify="flex-end">
          <Button variant="outline" disabled>
            Edit profile (soon)
          </Button>
        </HStack>
      </Stack>
    </Box>
  )
}

export default Profile
