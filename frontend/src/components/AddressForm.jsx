import { Box, Button, Field, HStack, Input, Stack, Text } from "@chakra-ui/react"

const AddressForm = ({
  title = "Address",
  draft,
  onChange,
  onSubmit,
  submitLabel = "Save address",
  onCancel,
}) => {
  return (
    <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4}>
      <Stack gap={3}>
        <Text fontSize="md" fontWeight="800">
          {title}
        </Text>

        <Stack gap={3}>
          <HStack gap={3} flexWrap="wrap">
            <Field.Root flex="1" minW="240px">
              <Field.Label>First name</Field.Label>
              <Input value={draft.firstName} onChange={(e) => onChange({ firstName: e.target.value })} />
            </Field.Root>
            <Field.Root flex="1" minW="240px">
              <Field.Label>Last name</Field.Label>
              <Input value={draft.lastName} onChange={(e) => onChange({ lastName: e.target.value })} />
            </Field.Root>
          </HStack>

          <Field.Root>
            <Field.Label>Phone</Field.Label>
            <Input value={draft.phone} onChange={(e) => onChange({ phone: e.target.value })} />
          </Field.Root>

          <HStack gap={3} flexWrap="wrap">
            <Field.Root flex="1" minW="240px">
              <Field.Label>Country</Field.Label>
              <Input value={draft.country} onChange={(e) => onChange({ country: e.target.value })} />
            </Field.Root>
            <Field.Root flex="1" minW="240px">
              <Field.Label>City</Field.Label>
              <Input value={draft.city} onChange={(e) => onChange({ city: e.target.value })} />
            </Field.Root>
          </HStack>

          <HStack gap={3} flexWrap="wrap">
            <Field.Root flex="1" minW="240px">
              <Field.Label>Postal code</Field.Label>
              <Input value={draft.postalcode} onChange={(e) => onChange({ postalcode: e.target.value })} />
            </Field.Root>
            <Field.Root flex="2" minW="240px">
              <Field.Label>Street</Field.Label>
              <Input value={draft.street} onChange={(e) => onChange({ street: e.target.value })} />
            </Field.Root>
          </HStack>

          <HStack gap={3} flexWrap="wrap">
            <Field.Root flex="2" minW="240px">
              <Field.Label>Building</Field.Label>
              <Input value={draft.building} onChange={(e) => onChange({ building: e.target.value })} />
            </Field.Root>
            <Field.Root flex="1" minW="160px">
              <Field.Label>Floor</Field.Label>
              <Input
                type="number"
                value={draft.floor}
                onChange={(e) => onChange({ floor: e.target.value })}
              />
            </Field.Root>
          </HStack>

          <Field.Root>
            <Field.Label>Special mark</Field.Label>
            <Input
              value={draft.special_mark}
              onChange={(e) => onChange({ special_mark: e.target.value })}
            />
          </Field.Root>

          <HStack>
            <Button onClick={onSubmit}>{submitLabel}</Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
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
