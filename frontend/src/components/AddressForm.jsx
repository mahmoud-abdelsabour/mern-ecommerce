import { Box, Button, Field, HStack, Input, Stack, Text } from "@chakra-ui/react"

const AddressForm = ({
  title = "Address",
  draft,
  onChange,
  onSubmit,
  submitLabel = "Save",
  onCancel,
  disabled = false,
}) => {
  return (
    <Box borderWidth="1px" borderColor="surface.border" bg="surface.panel" rounded="lg" p={{ base: 4, md: 5 }} w="100%">
      <Stack gap={4}>
        <Text fontSize="md" fontWeight="800">
          {title}
        </Text>

        <Stack gap={4}>
          <Field.Root>
            <Field.Label color="text.secondary">Address name</Field.Label>
            <Input
              value={draft.address_name}
              onChange={(e) => onChange({ address_name: e.target.value })}
              disabled={disabled}
            />
          </Field.Root>

          <HStack gap={3} flexWrap="wrap">
            <Field.Root flex="1" minW="240px">
              <Field.Label color="text.secondary">Country</Field.Label>
              <Input
                value={draft.country}
                onChange={(e) => onChange({ country: e.target.value })}
                disabled={disabled}
              />
            </Field.Root>
            <Field.Root flex="1" minW="240px">
              <Field.Label color="text.secondary">City</Field.Label>
              <Input
                value={draft.city}
                onChange={(e) => onChange({ city: e.target.value })}
                disabled={disabled}
              />
            </Field.Root>
          </HStack>

          <HStack gap={3} flexWrap="wrap">
            <Field.Root flex="1" minW="240px">
              <Field.Label color="text.secondary">Postal code</Field.Label>
              <Input
                value={draft.postalcode}
                onChange={(e) => onChange({ postalcode: e.target.value })}
                disabled={disabled}
              />
            </Field.Root>
            <Field.Root flex="2" minW="240px">
              <Field.Label color="text.secondary">Street</Field.Label>
              <Input
                value={draft.street}
                onChange={(e) => onChange({ street: e.target.value })}
                disabled={disabled}
              />
            </Field.Root>
          </HStack>

          <HStack gap={3} flexWrap="wrap">
            <Field.Root flex="2" minW="240px">
              <Field.Label color="text.secondary">Building</Field.Label>
              <Input
                value={draft.building}
                onChange={(e) => onChange({ building: e.target.value })}
                disabled={disabled}
              />
            </Field.Root>
            <Field.Root flex="1" minW="160px">
              <Field.Label color="text.secondary">Floor</Field.Label>
              <Input
                type="number"
                value={draft.floor}
                onChange={(e) => onChange({ floor: e.target.value })}
                disabled={disabled}
              />
            </Field.Root>
          </HStack>

          <Field.Root>
            <Field.Label color="text.secondary">Special mark</Field.Label>
            <Input
              value={draft.special_mark}
              onChange={(e) => onChange({ special_mark: e.target.value })}
              disabled={disabled}
            />
          </Field.Root>

          <HStack>
            <Button onClick={onSubmit} colorPalette="brand" disabled={disabled}>
              {submitLabel}
            </Button>
            {onCancel && (
              <Button variant="outline" colorPalette="neutral" onClick={onCancel} disabled={disabled}>
                Cancel
              </Button>
            )}
          </HStack>
        </Stack>
      </Stack>
    </Box>
  )
}

export default AddressForm
