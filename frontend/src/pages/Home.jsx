import { Carousel, IconButton, Box, Button, Flex, HStack, Text } from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"
import { ProductCard } from "../components/ProductCard"
import { properties } from "../constants/products"

const items = [
  "https://picsum.photos/seed/hero-1/1200/500",
  "https://picsum.photos/seed/hero-2/1200/500",
  "https://picsum.photos/seed/hero-3/1200/500",
  "https://picsum.photos/seed/hero-4/1200/500",
  "https://picsum.photos/seed/hero-5/1200/500"
]


const Home = () => {
  return (
        <Box maxW="1400px" mx="auto" px={4}>
            {/* Hero Section */}
            <Carousel.Root autoplay={true} slideCount={items.length} w="100%">
            <Carousel.ItemGroup>
                {items.map((src, index) => (
                <Carousel.Item key={index} index={index}>
                    <Box
                    w="100%"
                    h="400px"
                    rounded="lg"
                    backgroundImage={`url(${src})`}
                    backgroundSize="cover"
                    backgroundPosition="center"
                    />
                </Carousel.Item>
                ))}
            </Carousel.ItemGroup>

            <Carousel.Control justifyContent="center" gap="4">
                <Carousel.PrevTrigger asChild>
                <IconButton size="xs" variant="ghost">
                    <LuChevronLeft />
                </IconButton>
                </Carousel.PrevTrigger>

                <Carousel.Indicators />

                <Carousel.NextTrigger asChild>
                <IconButton size="xs" variant="ghost">
                    <LuChevronRight />
                </IconButton>
                </Carousel.NextTrigger>
            </Carousel.Control>
            </Carousel.Root>
            <Flex justify="center" mt={4}>
                <Button as={RouterLink} to="/catalog">
                    Shop Now
                </Button>
            </Flex>

            {/* featured products */}
            <Carousel.Root slideCount={properties.length} slidesPerPage={6} gap="0">
                <HStack justify="space-between">
                    <Text fontWeight="700" fontSize="xl">
                        Featured Products
                    </Text>
                    <HStack>
                        <Carousel.PrevTrigger asChild>
                            <IconButton size="xs" variant="subtle">
                                <LuChevronLeft />
                            </IconButton>
                        </Carousel.PrevTrigger>
                        <Carousel.NextTrigger asChild>
                            <IconButton size="xs" variant="subtle">
                                <LuChevronRight />
                            </IconButton>
                        </Carousel.NextTrigger>
                    </HStack>
                </HStack>
                <Carousel.ItemGroup>
                    {properties.map((property, index) => (
                        <Carousel.Item key={property.id} index={index}>
                            <ProductCard data={property} />
                        </Carousel.Item>
                    ))}
                </Carousel.ItemGroup>
            </Carousel.Root>

            {/* Top Rated */}
            <Box mt={10}>
                <Carousel.Root slideCount={properties.length} slidesPerPage={6} gap="0">
                    <HStack justify="space-between">
                        <Text fontWeight="700" fontSize="xl">
                            Top Rated
                        </Text>
                        <HStack>
                            <Carousel.PrevTrigger asChild>
                                <IconButton size="xs" variant="subtle">
                                    <LuChevronLeft />
                                </IconButton>
                            </Carousel.PrevTrigger>
                            <Carousel.NextTrigger asChild>
                                <IconButton size="xs" variant="subtle">
                                    <LuChevronRight />
                                </IconButton>
                            </Carousel.NextTrigger>
                        </HStack>
                    </HStack>
                    <Carousel.ItemGroup>
                        {properties.map((property, index) => (
                            <Carousel.Item key={`top-${property.id}`} index={index}>
                                <ProductCard data={property} />
                            </Carousel.Item>
                        ))}
                    </Carousel.ItemGroup>
                </Carousel.Root>
            </Box>

            {/* Electronics */}
            <Box mt={10}>
                <Carousel.Root slideCount={properties.length} slidesPerPage={6} gap="0">
                    <HStack justify="space-between">
                        <Text fontWeight="700" fontSize="xl">
                            Electronics
                        </Text>
                        <HStack>
                            <Carousel.PrevTrigger asChild>
                                <IconButton size="xs" variant="subtle">
                                    <LuChevronLeft />
                                </IconButton>
                            </Carousel.PrevTrigger>
                            <Carousel.NextTrigger asChild>
                                <IconButton size="xs" variant="subtle">
                                    <LuChevronRight />
                                </IconButton>
                            </Carousel.NextTrigger>
                        </HStack>
                    </HStack>
                    <Carousel.ItemGroup>
                        {properties.map((property, index) => (
                            <Carousel.Item key={`elec-${property.id}`} index={index}>
                                <ProductCard data={property} />
                            </Carousel.Item>
                        ))}
                    </Carousel.ItemGroup>
                </Carousel.Root>
            </Box>
        </Box>
  )
}








export default Home
