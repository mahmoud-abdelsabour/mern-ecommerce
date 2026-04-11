import { Badge, Box, HStack, Image, Stack, Text } from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"
import { TbBrandCashapp } from "react-icons/tb"
import { FaClock } from "react-icons/fa"
import { MdLocalShipping, MdOutlineDoneOutline, MdCancel } from "react-icons/md"
import { RiRefund2Line } from "react-icons/ri"
import { GrReturn } from "react-icons/gr"

const OrderCard = ({ order }) => {
  const items = order?.items ?? []
  const firstImage = items[0]?.image
  const secondImage = items[1]?.image
  const orderId = order?.id ?? order?._id
  const to = orderId != null && orderId !== "" ? `/order/${orderId}` : null

  return (
    <Box
      {...(to ? { as: RouterLink, to } : {})}
      display="block"
      borderWidth="1px"
      borderColor="gray.200"
      rounded="md"
      p={4}
      cursor={to ? "pointer" : "default"}
      textDecoration="none"
      color="inherit"
      transition="border-color 0.15s ease, box-shadow 0.15s ease"
      _hover={
        to
          ? { borderColor: "gray.300", boxShadow: "sm" }
          : undefined
      }
      _focusVisible={
        to
          ? { outline: "2px solid", outlineColor: "teal.500", outlineOffset: "2px" }
          : undefined
      }
    >
      <HStack spacing={3} align="start">
        <HStack spacing={2}>
          {firstImage && (
            <Box w="80px" h="80px" rounded="md" overflow="hidden">
              <Image
                src={firstImage}
                alt="Order item 1"
                w="100%"
                h="100%"
                objectFit="cover"
              />
            </Box>
          )}
          {secondImage && (
            <Box w="80px" h="80px" rounded="md" overflow="hidden">
              <Image
                src={secondImage}
                alt="Order item 2"
                w="100%"
                h="100%"
                objectFit="cover"
              />
            </Box>
          )}
        </HStack>

        <Stack spacing={2} flex="1">
          <Text fontSize="sm" color="gray.500">
            {order?.createdAt ?? "—"}
          </Text>
          <HStack gap={2}>
            <TbBrandCashapp />
            <Text fontSize="sm">
              Payment:{" "}
              <Text as="span" fontWeight="600">
                {order?.paymentMethod ?? "COD"}
              </Text>
            </Text>
          </HStack>
          <HStack gap={2}>
            <Text fontSize="sm">Status:</Text>
            <StatusBadge status={order?.status ?? "pending"} />
          </HStack>
          <Text fontSize="sm">
            Total:{" "}
            <Text as="span" fontWeight="700">
              ${order?.totalPrice ?? "0.00"}
            </Text>
          </Text>
        </Stack>
      </HStack>
    </Box>
  )
}

export default OrderCard

const StatusBadge = ({ status }) => {
  const normalized = String(status).toLowerCase()

  const config = {
    pending: { icon: <FaClock />, color: "yellow" },
    shipped: { icon: <MdLocalShipping />, color: "blue" },
    delivered: { icon: <MdOutlineDoneOutline />, color: "green" },
    cancelled: { icon: <MdCancel />, color: "red" },
    "return requested": { icon: <GrReturn />, color: "orange" },
    returned: { icon: <GrReturn />, color: "orange" },
    refunded: { icon: <RiRefund2Line />, color: "purple" },
  }

  const { icon, color } = config[normalized] || {
    icon: <FaClock />,
    color: "gray",
  }

  return (
    <Badge variant="solid" colorPalette={color}>
      <HStack gap={1}>
        {icon}
        <Text fontSize="xs" fontWeight="600" textTransform="capitalize">
          {status}
        </Text>
      </HStack>
    </Badge>
  )
}
