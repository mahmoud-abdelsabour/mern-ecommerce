import { Box, Button, Field, HStack, Input, Stack, Text } from "@chakra-ui/react"

const SavedAddressForm = ({
  title = "Address",
  draft,
  onChange,
  onSubmit,
  submitLabel = "Save",
  onCancel,
  disabled = false,
}) => {
  return (
    <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4} w="100%">
      <Stack gap={3}>
        <Text fontSize="md" fontWeight="800">
          {title}
        </Text>

        <Stack gap={3}>
          <Field.Root>
            <Field.Label>Address name</Field.Label>
            <Input
              value={draft.address_name}
              onChange={(e) => onChange({ address_name: e.target.value })}
              disabled={disabled}
            />
          </Field.Root>

          <HStack gap={3} flexWrap="wrap">
            <Field.Root flex="1" minW="240px">
              <Field.Label>Country</Field.Label>
              <Input
                value={draft.country}
                onChange={(e) => onChange({ country: e.target.value })}
                disabled={disabled}
              />
            </Field.Root>
            <Field.Root flex="1" minW="240px">
              <Field.Label>City</Field.Label>
              <Input
                value={draft.city}
                onChange={(e) => onChange({ city: e.target.value })}
                disabled={disabled}
              />
            </Field.Root>
          </HStack>

          <HStack gap={3} flexWrap="wrap">
            <Field.Root flex="1" minW="240px">
              <Field.Label>Postal code</Field.Label>
              <Input
                value={draft.postalcode}
                onChange={(e) => onChange({ postalcode: e.target.value })}
                disabled={disabled}
              />
            </Field.Root>
            <Field.Root flex="2" minW="240px">
              <Field.Label>Street</Field.Label>
              <Input
                value={draft.street}
                onChange={(e) => onChange({ street: e.target.value })}
                disabled={disabled}
              />
            </Field.Root>
          </HStack>

          <HStack gap={3} flexWrap="wrap">
            <Field.Root flex="2" minW="240px">
              <Field.Label>Building</Field.Label>
              <Input
                value={draft.building}
                onChange={(e) => onChange({ building: e.target.value })}
                disabled={disabled}
              />
            </Field.Root>
            <Field.Root flex="1" minW="160px">
              <Field.Label>Floor</Field.Label>
              <Input
                type="number"
                value={draft.floor}
                onChange={(e) => onChange({ floor: e.target.value })}
                disabled={disabled}
              />
            </Field.Root>
          </HStack>

          <Field.Root>
            <Field.Label>Special mark</Field.Label>
            <Input
              value={draft.special_mark}
              onChange={(e) => onChange({ special_mark: e.target.value })}
              disabled={disabled}
            />
          </Field.Root>

          <HStack>
            <Button onClick={onSubmit} disabled={disabled}>
              {submitLabel}
            </Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={disabled}>
                Cancel
              </Button>
            )}
          </HStack>
        </Stack>
      </Stack>
    </Box>
  )
}

export default SavedAddressForm

