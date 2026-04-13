import { Box, Separator, Stack, Text } from "@chakra-ui/react"

const AddressCard = ({ shippingInfo }) => {
  const firstName = shippingInfo?.firstName ?? "—"
  const lastName = shippingInfo?.lastName ?? "—"
  const phone = shippingInfo?.phone ?? "—"

  const country = shippingInfo?.address?.country ?? "—"
  const city = shippingInfo?.address?.city ?? "—"
  const postalcode = shippingInfo?.address?.postalcode ?? "—"
  const street = shippingInfo?.address?.street ?? "—"
  const building = shippingInfo?.address?.building ?? "—"
  const floor = shippingInfo?.address?.floor ?? "—"
  const specialMark = shippingInfo?.address?.special_mark ?? "—"

  return (
    <Box borderWidth="1px" borderColor="surface.border" bg="surface.panel" rounded="lg" p={4}>
      <Stack gap={2}>
        <Text fontSize="lg" fontWeight="800">
          Shipping Address
        </Text>
        <Separator />
        <Stack gap={1}>
          <Text fontSize="sm">
            Name:{" "}
            <Text as="span" fontWeight="700">
              {firstName} {lastName}
            </Text>
          </Text>
          <Text fontSize="sm">
            Phone:{" "}
            <Text as="span" fontWeight="700">
              {phone}
            </Text>
          </Text>
        </Stack>

        <Separator />

        <Stack gap={1}>
          <Text fontSize="sm">
            Country: <Text as="span" fontWeight="700">{country}</Text>
          </Text>
          <Text fontSize="sm">
            City: <Text as="span" fontWeight="700">{city}</Text>
          </Text>
          <Text fontSize="sm">
            Postal code: <Text as="span" fontWeight="700">{postalcode}</Text>
          </Text>
          <Text fontSize="sm">
            Street: <Text as="span" fontWeight="700">{street}</Text>
          </Text>
          <Text fontSize="sm">
            Building: <Text as="span" fontWeight="700">{building}</Text>
          </Text>
          <Text fontSize="sm">
            Floor: <Text as="span" fontWeight="700">{floor}</Text>
          </Text>
          <Text fontSize="sm">
            Special mark: <Text as="span" fontWeight="700">{specialMark}</Text>
          </Text>
        </Stack>
      </Stack>
    </Box>
  )
}

export default AddressCard
