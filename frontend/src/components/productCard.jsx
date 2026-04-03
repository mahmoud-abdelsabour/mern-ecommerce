import { Box, Stack, Image, HStack, Icon, Text, Button, IconButton } from '@chakra-ui/react'
import { FaStar } from 'react-icons/fa'
import { LuMinus, LuPlus } from "react-icons/lu"
import { ICON_SIZE } from '../constants/ui'

const ProductCard = ({ data, variant = "default" }) => (
  <Stack gap="2" borderWidth="1px" borderColor="gray.200" rounded="md" p={2} w="100%" maxW="200px">
    <Box position="relative" w="100%" aspectRatio={1}>
      <Image
        src={data.image}
        alt={data.title}
        w="100%"
        h="100%"
        objectFit="cover"
        rounded="md"
        draggable={false}
      />
    </Box>
    <Text fontWeight="semibold" fontSize="sm" noOfLines={2}>
      {data.title}
    </Text>
    <Text fontSize="xs" color="gray.500" noOfLines={1}>
      {data.brand} • {data.category}
    </Text>
    <HStack justify="space-between" align="center">
      <Text fontWeight="medium" fontSize="sm">
        ${data.price}
      </Text>
      <HStack gap="1">
        <Icon color="orange.400">
          <FaStar size={ICON_SIZE} />
        </Icon>
        <Text fontWeight="medium" fontSize="sm">
          {data.rating}
        </Text>
      </HStack>
    </HStack>
    {variant === "cart" ? (
      <HStack justify="space-between" align="center">
        <IconButton size="xs" variant="outline" aria-label="Decrease">
          <LuMinus size={ICON_SIZE} />
        </IconButton>
        <Text fontSize="xs" fontWeight="600">
          Qty: {data.quantity ?? 1}
        </Text>
        <IconButton size="xs" variant="outline" aria-label="Increase">
          <LuPlus size={ICON_SIZE} />
        </IconButton>
      </HStack>
    ) : (
      <HStack>
        <Button size="xs" variant="outline" flex="1">
          Add to cart
        </Button>
        <Button size="xs" colorScheme="teal" flex="1">
          Buy now
        </Button>
      </HStack>
    )}
  </Stack>
)

const properties = [
  {
    id: 1,
    title: "Loft Apartment in City Bowl",
    price: 152,
    rating: 4.92,
    brand: "Aether",
    category: "Home",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  },
  {
    id: 2,
    title: "Modern Studio, Camps Bay Beachfront",
    price: 296,
    rating: 4.99,
    brand: "Nimbus",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
  },
  {
    id: 3,
    title: "Retreat in Hout Bay with Views",
    price: 257,
    rating: 4.94,
    brand: "Lumen",
    category: "Outdoors",
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
  },
  {
    id: 4,
    title: "Sunny Flat in Sea Point",
    price: 132,
    rating: 4.87,
    brand: "Crest",
    category: "Home",
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
  },
  {
    id: 5,
    title: "V&A Waterfront City Studio",
    price: 200,
    rating: 4.83,
    brand: "Vertex",
    category: "Lifestyle",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  },
  {
    id: 6,
    title: "Luxury Pad, Bantry Bay",
    price: 247,
    rating: 4.96,
    brand: "Solace",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  },
  {
    id: 7,
    title: "Cozy Nest in Green Point",
    price: 135,
    rating: 4.81,
    brand: "Aurora",
    category: "Home",
    image:
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80",
  },
  {
    id: 8,
    title: "Elegant Villa in Constantia",
    price: 450,
    rating: 4.98,
    brand: "Atlas",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  },
]

export { ProductCard, properties }
