import { createElement, useMemo } from "react"
import {
  Box,
  Button,
  Carousel,
  Flex,
  HStack,
  IconButton,
  Image,
  Input,
  SimpleGrid,
  Skeleton,
  SkeletonText,
  Stack,
  Text,
  Field,
} from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"
import { MdHeadsetMic, MdLocalShipping, MdUndo, MdVerifiedUser } from "react-icons/md"
import { ProductCard } from "../components/ProductCard"
import ProductCardSkeleton from "../components/skeletons/ProductCardSkeleton"
import { useCategories } from "../hooks/useCategories"
import { useProducts } from "../hooks/useProducts"
import { slugifyLoose } from "../utils/filterHelpers"

const items = [
  "https://picsum.photos/seed/hero-1/1200/500",
  "https://picsum.photos/seed/hero-2/1200/500",
  "https://picsum.photos/seed/hero-3/1200/500",
  "https://picsum.photos/seed/hero-4/1200/500",
  "https://picsum.photos/seed/hero-5/1200/500",
]

const VALUE_PROPS = [
  {
    icon: MdLocalShipping,
    label: "Fast delivery",
    description: "Reliable shipping nationwide",
  },
  {
    icon: MdVerifiedUser,
    label: "Secure checkout",
    description: "Your data stays protected",
  },
  {
    icon: MdUndo,
    label: "Easy returns",
    description: "Hassle-free within policy",
  },
  {
    icon: MdHeadsetMic,
    label: "24/7 support",
    description: "We are here to help",
  },
]

/** Placeholder imagery only; labels and links come from the API. */
const CATEGORY_IMAGES = [
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
  "https://images.unsplash.com/photo-1498049794561-8590a73e1b69?w=800&q=80",
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
]

const mapProductForCard = (p) => {
  if (!p) return null
  const score = p?.rating?.score
  const rating =
    score != null && Number.isFinite(Number(score)) ? Math.round(Number(score) * 10) / 10 : undefined
  const brand =
    typeof p?.brand === "object" && p?.brand?.name != null ? p.brand.name : p?.brand ?? "—"
  const category =
    typeof p?.category === "object" && p?.category?.name != null
      ? p.category.name
      : p?.category ?? "—"
  return {
    id: p?.id ?? p?._id,
    title: p?.name,
    name: p?.name,
    price: p?.price,
    rating,
    brand,
    category,
    image: p?.photos?.[0],
  }
}

const categoryHref = (cat) => {
  const slug = cat?.slug || slugifyLoose(cat?.name)
  return `/catalog?category=${encodeURIComponent(slug)}`
}

const SectionHeader = ({ title, subtitle, seeAllTo, seeAllLabel = "See all" }) => (
  <Flex
    justify="space-between"
    align={{ base: "start", md: "end" }}
    gap={4}
    flexDir={{ base: "column", md: "row" }}
    mb={6}
  >
    <Stack gap={1} maxW="2xl">
      <Text
        as="h2"
        fontSize={{ base: "xl", md: "2xl" }}
        fontWeight="800"
        letterSpacing="-0.02em"
        color="text.primary"
      >
        {title}
      </Text>
      {subtitle ? (
        <Text fontSize="sm" color="text.secondary" lineHeight="1.6">
          {subtitle}
        </Text>
      ) : null}
    </Stack>
    {seeAllTo ? (
      <Button
        as={RouterLink}
        to={seeAllTo}
        variant="ghost"
        colorPalette="brand"
        size="sm"
        fontWeight="600"
        flexShrink={0}
      >
        {seeAllLabel}
      </Button>
    ) : null}
  </Flex>
)

const ProductRail = ({ title, subtitle, seeAllTo, railKey, items, isLoading }) => {
  if (isLoading) {
    return (
      <Box>
        <SectionHeader title={title} subtitle={subtitle} seeAllTo={seeAllTo} />
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4, lg: 6 }} gap={4}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <ProductCardSkeleton key={`${railKey}-skel-${idx}`} />
          ))}
        </SimpleGrid>
      </Box>
    )
  }

  if (!items?.length) {
    return (
      <Box>
        <SectionHeader title={title} subtitle={subtitle} seeAllTo={seeAllTo} />
        <Text fontSize="sm" color="text.muted">
          No products to show yet.
        </Text>
      </Box>
    )
  }

  return (
    <Box>
      <SectionHeader title={title} subtitle={subtitle} seeAllTo={seeAllTo} />
      <Box
        display={{ base: "block", lg: "none" }}
        overflowX="auto"
        overflowY="hidden"
        scrollSnapType="x mandatory"
        scrollBehavior="smooth"
        pb={2}
      >
        <HStack align="stretch" gap={4} minW="max-content" pr={1}>
          {items.map((property, index) => (
            <Box
              key={`${railKey}-${property.id}-${index}`}
              flex="0 0 auto"
              minW="200px"
              maxW="200px"
              scrollSnapAlign="start"
            >
              <ProductCard data={property} />
            </Box>
          ))}
        </HStack>
      </Box>

      <Carousel.Root display={{ base: "none", lg: "block" }} slideCount={items.length} slidesPerPage={6} gap="0">
        <HStack justify="flex-end" mb={3}>
          <Carousel.PrevTrigger asChild>
            <IconButton size="sm" variant="outline" borderColor="surface.border" aria-label="Previous products">
              <LuChevronLeft />
            </IconButton>
          </Carousel.PrevTrigger>
          <Carousel.NextTrigger asChild>
            <IconButton size="sm" variant="outline" borderColor="surface.border" aria-label="Next products">
              <LuChevronRight />
            </IconButton>
          </Carousel.NextTrigger>
        </HStack>
        <Carousel.ItemGroup>
          {items.map((property, index) => (
            <Carousel.Item key={`${railKey}-${property.id}-${index}`} index={index}>
              <ProductCard data={property} />
            </Carousel.Item>
          ))}
        </Carousel.ItemGroup>
      </Carousel.Root>
    </Box>
  )
}

const Home = () => {
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories()

  const sortedCategories = useMemo(() => {
    const list = categoriesData?.categories ?? []
    return [...list].sort((a, b) => String(a?.name ?? "").localeCompare(String(b?.name ?? "")))
  }, [categoriesData])

  const categoryTiles = useMemo(
    () =>
      sortedCategories.slice(0, 4).map((cat, i) => ({
        key: String(cat?.id ?? cat?._id ?? cat?.slug ?? i),
        label: cat?.name ?? "—",
        to: categoryHref(cat),
        image: CATEGORY_IMAGES[i % CATEGORY_IMAGES.length],
      })),
    [sortedCategories]
  )

  const spotlightCategory = sortedCategories[0]
  const spotlightSlug = spotlightCategory ? spotlightCategory.slug || slugifyLoose(spotlightCategory.name) : null

  const featuredFilters = useMemo(
    () => ({
      page: 1,
      limit: 12,
      sort: JSON.stringify({ createdAt: -1 }),
    }),
    []
  )

  const topRatedFilters = useMemo(
    () => ({
      page: 1,
      limit: 12,
      sort: JSON.stringify({ "rating.score": -1 }),
    }),
    []
  )

  const spotlightFilters = useMemo(
    () =>
      spotlightSlug
        ? {
            page: 1,
            limit: 12,
            category: spotlightSlug,
            sort: JSON.stringify({ createdAt: -1 }),
          }
        : { page: 1, limit: 12 },
    [spotlightSlug]
  )

  const { data: featuredData, isLoading: featuredLoading } = useProducts(featuredFilters)
  const { data: topRatedData, isLoading: topRatedLoading } = useProducts(topRatedFilters)
  const { data: spotlightData, isLoading: spotlightLoading } = useProducts(spotlightFilters, {
    enabled: Boolean(spotlightSlug),
  })

  const featuredItems = useMemo(
    () => (featuredData?.products ?? []).map(mapProductForCard).filter(Boolean),
    [featuredData]
  )
  const topRatedItems = useMemo(
    () => (topRatedData?.products ?? []).map(mapProductForCard).filter(Boolean),
    [topRatedData]
  )
  const spotlightItems = useMemo(
    () => (spotlightData?.products ?? []).map(mapProductForCard).filter(Boolean),
    [spotlightData]
  )

  const spotlightTitle = spotlightCategory?.name
    ? `${spotlightCategory.name}`
    : "Category spotlight"
  const spotlightSubtitle = spotlightCategory?.name
    ? `Fresh listings from ${spotlightCategory.name}.`
    : "Explore a featured department from our catalog."
  const spotlightSeeAll = spotlightSlug ? `/catalog?category=${encodeURIComponent(spotlightSlug)}` : "/catalog"

  return (
    <Box bg="surface.canvas" minH="100%">
      <Box maxW="1400px" mx="auto" px={4} py={{ base: 6, md: 10 }}>
        {/* Hero Section */}
        <Box mb={{ base: 10, md: 14 }}>
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
            <Button as={RouterLink} to="/catalog" colorPalette="brand">
              Shop Now
            </Button>
          </Flex>
        </Box>

        {/* Trust / value strip */}
        <SimpleGrid
          columns={{ base: 2, md: 4 }}
          gap={{ base: 4, md: 6 }}
          py={{ base: 5, md: 6 }}
          px={{ base: 4, md: 8 }}
          bg="surface.panel"
          rounded="xl"
          borderWidth="1px"
          borderColor="surface.border"
          mb={{ base: 14, md: 20 }}
        >
          {VALUE_PROPS.map(({ icon, label, description }) => (
            <HStack key={label} align="start" gap={3}>
              <Flex
                w="10"
                h="10"
                rounded="lg"
                bg="surface.subtle"
                color="brand.700"
                align="center"
                justify="center"
                flexShrink={0}
              >
                {createElement(icon, { size: 22 })}
              </Flex>
              <Stack gap={0}>
                <Text fontSize="sm" fontWeight="700" color="text.primary">
                  {label}
                </Text>
                <Text fontSize="xs" color="text.secondary" lineHeight="short">
                  {description}
                </Text>
              </Stack>
            </HStack>
          ))}
        </SimpleGrid>

        {/* Shop by category */}
        <Stack gap={0} mb={{ base: 14, md: 20 }}>
          <SectionHeader
            title="Shop by category"
            subtitle="Explore departments tailored to how you shop—jump in with one tap."
            seeAllTo="/catalog"
          />
          {categoriesLoading ? (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
              {Array.from({ length: 4 }).map((_, idx) => (
                <Box
                  key={`cat-skel-${idx}`}
                  position="relative"
                  overflow="hidden"
                  rounded="xl"
                  h={{ base: "200px", md: "220px" }}
                  borderWidth="1px"
                  borderColor="gray.200"
                  bg="white"
                >
                  <Skeleton w="100%" h="100%" />
                  <Box position="absolute" bottom={4} left={4} right={4}>
                    <SkeletonText noOfLines={1} />
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          ) : categoryTiles.length === 0 ? (
            <Text fontSize="sm" color="text.muted">
              No categories available yet.
            </Text>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
              {categoryTiles.map((cat) => (
                <Box
                  key={cat.key}
                  as={RouterLink}
                  to={cat.to}
                  position="relative"
                  overflow="hidden"
                  rounded="xl"
                  h={{ base: "200px", md: "220px" }}
                  borderWidth="1px"
                  borderColor="surface.border"
                  _hover={{
                    borderColor: "brand.300",
                    shadow: "md",
                    "& .cat-img": { transform: "scale(1.05)" },
                  }}
                  transition="border-color 0.2s ease, box-shadow 0.2s ease"
                >
                  <Image
                    className="cat-img"
                    src={cat.image}
                    alt=""
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    transition="transform 0.35s ease"
                  />
                  <Box
                    position="absolute"
                    inset={0}
                    bg="blackAlpha.600"
                  />
                  <Text
                    position="absolute"
                    bottom={4}
                    left={4}
                    right={4}
                    color="white"
                    fontWeight="800"
                    fontSize="lg"
                    letterSpacing="-0.02em"
                  >
                    {cat.label}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Stack>

        {/* Product rails */}
        <Stack gap={{ base: 14, md: 20 }}>
          <ProductRail
            title="Featured picks"
            subtitle="Staff favorites and seasonal highlights—updated regularly."
            seeAllTo="/catalog"
            railKey="feat"
            items={featuredItems}
            isLoading={featuredLoading}
          />
          <ProductRail
            title="Top rated"
            subtitle="Highly reviewed by shoppers like you."
            seeAllTo={`/catalog?sort=${encodeURIComponent(JSON.stringify({ "rating.score": -1 }))}`}
            railKey="top"
            items={topRatedItems}
            isLoading={topRatedLoading}
          />
          {spotlightSlug ? (
            <ProductRail
              title={spotlightTitle}
              subtitle={spotlightSubtitle}
              seeAllTo={spotlightSeeAll}
              railKey="spot"
              items={spotlightItems}
              isLoading={spotlightLoading}
            />
          ) : null}
        </Stack>

        {/* Editorial band */}
        <Flex
          mt={{ base: 16, md: 24 }}
          mb={{ base: 14, md: 20 }}
          direction={{ base: "column", lg: "row" }}
          overflow="hidden"
          rounded="2xl"
          borderWidth="1px"
          borderColor="surface.border"
          bg="surface.panel"
        >
          <Box
            flex="1"
            minH={{ base: "220px", lg: "auto" }}
            backgroundImage="url(https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80)"
            backgroundSize="cover"
            backgroundPosition="center"
          />
          <Stack
            flex="1"
            justify="center"
            gap={4}
            p={{ base: 8, md: 12 }}
            maxW={{ lg: "50%" }}
          >
            <Text fontSize="xs" fontWeight="700" color="brand.600" textTransform="uppercase" letterSpacing="wider">
              Our story
            </Text>
            <Text as="h3" fontSize={{ base: "xl", md: "2xl" }} fontWeight="800" color="text.primary" lineHeight="short">
              Quality you can feel, service you can trust
            </Text>
            <Text fontSize="sm" color="text.secondary" lineHeight="1.75">
              We curate every collection with care—fewer compromises, clearer value, and support when you need it.
            </Text>
            <Box>
              <Button as={RouterLink} to="/catalog" variant="outline" colorPalette="neutral">
                Browse the catalog
              </Button>
            </Box>
          </Stack>
        </Flex>

        {/* Newsletter */}
        <Box
          py={{ base: 8, md: 10 }}
          px={{ base: 6, md: 12 }}
          rounded="2xl"
          bg={{ base: "neutral.900", _dark: "neutral.800" }}
          color="white"
          mb={4}
        >
          <Stack
            gap={6}
            align="stretch"
            direction={{ base: "column", md: "row" }}
            justify="space-between"
          >
            <Stack gap={2} maxW="lg">
              <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="800" letterSpacing="-0.02em">
                Stay in the loop
              </Text>
              <Text fontSize="sm" color="whiteAlpha.800">
                New drops and offers—no spam. Unsubscribe anytime.
              </Text>
            </Stack>
            <Flex
              as="form"
              gap={3}
              flex="1"
              maxW={{ md: "md" }}
              align={{ base: "stretch", sm: "flex-end" }}
              flexDir={{ base: "column", sm: "row" }}
              onSubmit={(e) => e.preventDefault()}
            >
              <Field.Root flex="1">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  bg="whiteAlpha.200"
                  borderColor="whiteAlpha.400"
                  color="white"
                  _placeholder={{ color: "whiteAlpha.600" }}
                  h="44px"
                  rounded="lg"
                />
              </Field.Root>
              <Button
                type="submit"
                bg="surface.panel"
                color="text.primary"
                h="44px"
                px={6}
                _hover={{ bg: "surface.subtle" }}
                _active={{ bg: "neutral.200" }}
              >
                Subscribe
              </Button>
            </Flex>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}

export default Home
