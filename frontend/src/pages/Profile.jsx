import {
  Avatar,
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  HStack,
  IconButton,
  Portal,
  Separator,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
import { HiPencil, HiPlus, HiTrash, HiUpload } from "react-icons/hi"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { getToken } from "../APIs/http"
import {
  useCreateAddress,
  useDeleteAddress,
  useMe,
  useUpdateAddress,
  useUpdateProfile,
} from "../hooks/useUser"
import GlobalNotification from "../components/GlobalNotification"
import { consumeFlash } from "../utils/flashStorage"
import AddressForm from "../components/AddressForm"
import { uploadProfileImageToCloudinary } from "../utils/cloudinaryUpload"

const createEmptyAddressDraft = () => {
  return {
    address_name: "",
    country: "",
    city: "",
    postalcode: "",
    street: "",
    building: "",
    floor: "",
    special_mark: "",
  }
}

const Profile = () => {
  const navigate = useNavigate()

  const token = getToken()
  const isLoggedIn = Boolean(token)

  // Fetch the authenticated user's actual profile from the backend.
  const { data: me, isLoading, isError, error } = useMe()

  const [notice, setNotice] = useState(null) // { id, status, title }
  const showNotice = (status, title) => setNotice({ id: Date.now(), status, title })

  // If the user is not logged in, redirect to login (protect /me route).
  useEffect(() => {
    if (!isLoggedIn) navigate("/login", { replace: true })
  }, [isLoggedIn, navigate])

  // One-time flash message (e.g. after updating profile/password/email).
  const [flash] = useState(() => consumeFlash())

  const [addressFormOpen, setAddressFormOpen] = useState(false)
  const [addressFormMode, setAddressFormMode] = useState("create") // 'create' | 'edit'
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressDraft, setAddressDraft] = useState(() => createEmptyAddressDraft())

  const openCreateAddress = () => {
    setAddressFormMode("create")
    setEditingAddressId(null)
    setAddressDraft(createEmptyAddressDraft())
    setAddressFormOpen((v) => !v)
  }

  const openEditAddress = (address) => {
    setAddressFormMode("edit")
    setEditingAddressId(address?._id ?? address?.id ?? null)
    setAddressDraft({
      address_name: address?.address_name ?? "",
      country: address?.country ?? "",
      city: address?.city ?? "",
      postalcode: address?.postalcode ?? "",
      street: address?.street ?? "",
      building: address?.building ?? "",
      floor: address?.floor ?? "",
      special_mark: address?.special_mark ?? "",
    })
    setAddressFormOpen(true)
  }

  const closeAddressForm = () => {
    setAddressFormOpen(false)
    setEditingAddressId(null)
    setAddressDraft(createEmptyAddressDraft())
    setAddressFormMode("create")
  }

  const createAddressMutation = useCreateAddress({
    onSuccess: (result) => {
      showNotice("success", result?.message ?? "Address added successfully.")
      closeAddressForm()
    },
  })

  const updateAddressMutation = useUpdateAddress({
    onSuccess: (result) => {
      showNotice("success", result?.message ?? "Address updated successfully.")
      closeAddressForm()
    },
  })

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  const updateProfileMutation = useUpdateProfile({})

  const deleteAddressMutation = useDeleteAddress({
    onSuccess: (result) => {
      showNotice("info", result?.message ?? "Address deleted successfully.")
      setDeleteDialogOpen(false)
      setDeletingAddress(null)
    },
  })

  const addressFormBusy = createAddressMutation.isPending || updateAddressMutation.isPending
  const deleteBusy = deleteAddressMutation.isPending
  const photoBusy = isUploadingPhoto || updateProfileMutation.isPending

  const onProfilePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    setIsUploadingPhoto(true)
    try {
      const url = await uploadProfileImageToCloudinary(file)
      updateProfileMutation.mutate(
        { profilePhoto: url },
        {
          onSuccess: () => {
            showNotice("success", "Profile photo updated.")
          },
          onSettled: () => setIsUploadingPhoto(false),
        }
      )
    } catch (err) {
      setIsUploadingPhoto(false)
      showNotice("error", err?.message ?? "Could not upload photo")
    }
  }

  const onSubmitAddress = () => {
    const payload = {
      address_name: String(addressDraft.address_name ?? "").trim(),
      country: String(addressDraft.country ?? "").trim(),
      city: String(addressDraft.city ?? "").trim(),
      postalcode: String(addressDraft.postalcode ?? "").trim(),
      street: String(addressDraft.street ?? "").trim(),
      building: String(addressDraft.building ?? "").trim(),
      floor: Number(addressDraft.floor),
      special_mark: String(addressDraft.special_mark ?? "").trim(),
    }

    if (addressFormMode === "edit") {
      if (!editingAddressId) return
      updateAddressMutation.mutate({ addressId: editingAddressId, fields: payload })
      return
    }

    createAddressMutation.mutate(payload)
  }

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingAddress, setDeletingAddress] = useState(null)
  const cancelRef = useRef(null)
  const photoInputRef = useRef(null)

  const onAskDelete = (address) => {
    setDeletingAddress(address)
    setDeleteDialogOpen(true)
  }

  if (!isLoggedIn) return null

  if (isLoading) {
    return (
      <Box maxW="1200px" mx="auto" px={4} py={8} w="100%">
        <Stack gap={6}>
          <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4} w="100%">
            <Stack gap={3}>
              <Skeleton h="18px" w="120px" />
              <Separator />
              <HStack align="center" spacing={4} flexWrap="wrap">
                <SkeletonCircle size="24" />
                <Stack gap={2}>
                  <Skeleton h="18px" w="220px" />
                  <Skeleton h="12px" w="140px" />
                </Stack>
              </HStack>

              <Stack gap={2}>
                <SkeletonText noOfLines={2} />
              </Stack>
            </Stack>
          </Box>

          <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4} w="100%">
            <Stack gap={3}>
              <Skeleton h="18px" w="170px" />
              <Separator />
              <SkeletonText noOfLines={4} />
              <HStack justify="flex-end" flexWrap="wrap" gap={2}>
                <Skeleton h="36px" w="120px" rounded="md" />
                <Skeleton h="36px" w="120px" rounded="md" />
              </HStack>
            </Stack>
          </Box>
        </Stack>
      </Box>
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
          key={notice?.id}
          status={notice?.status ?? "info"}
          title={notice?.title}
        />
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

            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: "none" }}
              aria-hidden
              onChange={onProfilePhotoChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              alignSelf="flex-start"
              loading={photoBusy}
              disabled={photoBusy}
              aria-label="Upload profile photo"
              onClick={() => photoInputRef.current?.click()}
            >
              <HiUpload /> Upload photo
            </Button>
            <Text fontSize="xs" color="gray.500">
              JPEG, PNG, WebP, or GIF · max 5 MB · hosted on Cloudinary
            </Text>
          </Stack>
        </Box>

        <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4} w="100%">
          <Stack gap={3}>
            <HStack justify="space-between" align="center" flexWrap="wrap">
              <Text fontSize="lg" fontWeight="800">
                Saved Addresses
              </Text>
              <IconButton
                aria-label="Add address"
                variant="outline"
                size="sm"
                onClick={openCreateAddress}
                disabled={addressFormBusy || deleteBusy}
              >
                <HiPlus />
              </IconButton>
            </HStack>
            <Separator />

            {addressFormOpen && (
              <AddressForm
                title={addressFormMode === "edit" ? "Edit address" : "Add address"}
                draft={addressDraft}
                onChange={(patch) => setAddressDraft((p) => ({ ...p, ...patch }))}
                onSubmit={onSubmitAddress}
                submitLabel={addressFormMode === "edit" ? "Save changes" : "Save address"}
                onCancel={closeAddressForm}
                disabled={addressFormBusy}
              />
            )}

            {addresses.length === 0 ? (
              <Text fontSize="sm" color="gray.600">
                No saved addresses yet.
              </Text>
            ) : (
              <Stack gap={3}>
                {addresses.map((a) => (
                  <Box
                    key={a?._id ?? a?.id ?? a?.address_name ?? JSON.stringify(a)}
                    borderWidth="1px"
                    borderColor="gray.200"
                    rounded="md"
                    p={4}
                  >
                    <Stack gap={2}>
                      <HStack justify="space-between" align="center" gap={3}>
                        <Text fontSize="sm" fontWeight="900">
                          {a?.address_name ?? "Address"}
                        </Text>
                        <HStack>
                          <IconButton
                            aria-label="Edit address"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditAddress(a)}
                            disabled={addressFormBusy || deleteBusy}
                          >
                            <HiPencil />
                          </IconButton>
                          <IconButton
                            aria-label="Delete address"
                            variant="ghost"
                            colorPalette="red"
                            size="sm"
                            onClick={() => onAskDelete(a)}
                            disabled={addressFormBusy || deleteBusy}
                          >
                            <HiTrash />
                          </IconButton>
                        </HStack>
                      </HStack>
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
              </Stack>
            )}
          </Stack>
        </Box>

        <Dialog.Root
          role="alertdialog"
          open={deleteDialogOpen}
          size="sm"
          onOpenChange={(e) => setDeleteDialogOpen(e.open)}
          placement="center"
        >
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.CloseTrigger asChild>
                  <CloseButton />
                </Dialog.CloseTrigger>
                <Dialog.Header>
                  <Dialog.Title>Confirm Delete</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <Text>
                    Are you sure you want to delete this address? This action cannot be undone.
                  </Text>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button
                    variant="outline"
                    ref={cancelRef}
                    onClick={() => setDeleteDialogOpen(false)}
                    disabled={deleteBusy}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorPalette="red"
                    onClick={() => {
                      const id = deletingAddress?._id ?? deletingAddress?.id ?? null
                      if (!id) return
                      deleteAddressMutation.mutate(id)
                    }}
                    disabled={deleteBusy}
                  >
                    Delete
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>

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
