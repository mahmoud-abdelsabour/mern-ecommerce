import { useState } from "react"
import {
  AspectRatio,
  Box,
  Carousel,
  CloseButton,
  Dialog,
  Flex,
  HStack,
  IconButton,
  Image,
  Portal,
  Text,
  useCarouselContext,
  RatingGroup,
  Button,
  Stack,
  Collapsible,
  Textarea 
} from "@chakra-ui/react"
import { LuChevronLeft, LuChevronRight, LuChevronDown } from "react-icons/lu"
import ReviewCard from "../components/ReviewCard"


const Product = () => {
  const [reviewRating, setReviewRating] = useState(0)
    let rn = 4652
  return (
    <Box maxW="1200px" mx="auto" px={4} mt={6} pb={10}>
      <Text fontSize="sm" color="gray.500" fontWeight="600">
        Brand Name
      </Text>
      <Text fontSize="3xl" fontWeight="800" mb={4}>
        Product Name
      </Text>
      <Dialog.Root size="full">
        <Flex justify="center">
          <Carousel.Root slideCount={items.length} maxW="2xl" gap="4" w="100%">
            {/* Product Hero */}
            <Carousel.Control justifyContent="center" gap="4" width="full">
              <Carousel.PrevTrigger asChild>
                <IconButton size="xs" variant="outline">
                  <LuChevronLeft />
                </IconButton>
              </Carousel.PrevTrigger>

              <Carousel.ItemGroup width="full">
                {items.map((item, index) => (
                  <Carousel.Item key={index} index={index}>
                    <Dialog.Trigger asChild>
                      <Image
                        aspectRatio="16/9"
                        src={item.url}
                        alt={item.label}
                        w="100%"
                        h="100%"
                        objectFit="cover"
                        cursor="pointer"
                      />
                    </Dialog.Trigger>
                  </Carousel.Item>
                ))}
              </Carousel.ItemGroup>

              <Carousel.NextTrigger asChild>
                <IconButton size="xs" variant="outline">
                  <LuChevronRight />
                </IconButton>
              </Carousel.NextTrigger>
            </Carousel.Control>

            <Carousel.IndicatorGroup>
              {items.map((item, index) => (
                <Carousel.Indicator
                  key={index}
                  index={index}
                  unstyled
                  _current={{
                    outline: "2px solid currentColor",
                    outlineOffset: "2px",
                  }}
                >
                  <Image
                    w="20"
                    aspectRatio="16/9"
                    src={item.url}
                    alt={item.label}
                    objectFit="cover"
                  />
                </Carousel.Indicator>
              ))}
            </Carousel.IndicatorGroup>
          </Carousel.Root>
        </Flex>

        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content bg="transparent" shadow="none">
              <Dialog.CloseTrigger asChild>
                <CloseButton size="lg" color="white" />
              </Dialog.CloseTrigger>

              <Dialog.Body
                display="flex"
                alignItems="center"
                justifyContent="center"
                h="full"
                p={0}
              >
                <Carousel.Root slideCount={items.length} w="full" h="full">
                  <Carousel.Control justifyContent="center" px="4" gap="4">
                    <Carousel.PrevTrigger asChild>
                      <IconButton size="xs" variant="ghost">
                        <LuChevronLeft />
                      </IconButton>
                    </Carousel.PrevTrigger>

                    <Carousel.ItemGroup width="full">
                      {items.map((item, index) => (
                        <Carousel.Item key={index} index={index}>
                          <AspectRatio ratio={16 / 9} maxH="72vh" w="full">
                            <Image
                              src={item.url}
                              alt={item.label}
                              objectFit="contain"
                            />
                          </AspectRatio>
                        </Carousel.Item>
                      ))}
                    </Carousel.ItemGroup>

                    <Carousel.NextTrigger asChild>
                      <IconButton size="xs" variant="ghost">
                        <LuChevronRight />
                      </IconButton>
                    </Carousel.NextTrigger>
                  </Carousel.Control>

                  <CarouselThumbnails items={items} />
                </Carousel.Root>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* price + rating */}
      <HStack justify="space-between" align="center" mt={4}>
        <Text fontSize="xl" fontWeight="700">
          $129.00
        </Text>
        <HStack gap="2" align="center">
          <RatingGroup.Root readOnly count={5} defaultValue={3} size="sm">
            <RatingGroup.HiddenInput />
            <RatingGroup.Control />
          </RatingGroup.Root>
          <Text fontSize="sm" color="gray.500">
            (4652)
          </Text>
        </HStack>
      </HStack>
      
      {/*buying buttons */}
      <HStack mt={3} gap={3} justify="center" mb={6}>
        <Button variant="outline" size="sm" minW="140px">
          Add to cart
        </Button>
        <Button colorScheme="teal" size="sm" minW="140px">
          Buy now
        </Button>
      </HStack>

      {/* description */}
      <Collapsible.Root collapsedHeight="100px">
        <Collapsible.Content
          _closed={{
            shadow: "inset 0 -12px 12px -12px var(--shadow-color)",
            shadowColor: "blackAlpha.500",
          }}
        >
          <Stack padding="4" borderWidth="1px" rounded="l2">
            <Text fontSize="lg" fontWeight="700">
              Description
            </Text>
            <Text fontSize="sm" color="gray.600">
              This product is built with premium materials and designed for
              everyday comfort. It offers reliable performance, clean styling,
              and a durable finish that stands up to regular use and daily wear.
            </Text>
            <Text fontSize="sm" color="gray.600">
              The design focuses on usability and durability, with carefully
              selected components that feel solid in hand. The finish resists
              smudges and scratches, keeping it looking fresh over time.
            </Text>
            <Text fontSize="sm" color="gray.600">
              Ideal for daily routines, it balances quality and value with a
              thoughtful design. Easy to maintain and made to last, it fits
              seamlessly into any setup and complements a wide range of styles.
            </Text>
            <Text fontSize="sm" color="gray.600">
              Whether for work, travel, or home use, it delivers consistent
              results with minimal effort. Built to be dependable, it is a
              practical choice for anyone who wants both function and style.
            </Text>
          </Stack>
        </Collapsible.Content>
        <Collapsible.Trigger asChild mt="4">
          <Button variant="outline" size="sm">
            <Collapsible.Context>
              {(api) => (api.open ? "Show Less" : "Show More")}
            </Collapsible.Context>
            <Collapsible.Indicator
              transition="transform 0.2s"
              _open={{ transform: "rotate(180deg)" }}
            >
              <LuChevronDown />
            </Collapsible.Indicator>
          </Button>
        </Collapsible.Trigger>
      </Collapsible.Root>

      {/* add review */}
      <Stack mt={8} gap={3}>
        <Text fontSize="md" fontWeight="700">
          Write a Review
        </Text>
        <RatingGroup.Root
          count={5}
          size="sm"
          value={reviewRating}
          onValueChange={(e) => setReviewRating(e.value ?? 0)}
        >
            <RatingGroup.HiddenInput />
            <RatingGroup.Control />
        </RatingGroup.Root>
        <Textarea placeholder="Comment..." minH="130px" />
        <Button mt={2} alignSelf="flex-start">
          Submit
        </Button>
      </Stack>

      {/* reviews */}
      <Stack mt={8} gap={4}>
        <Text fontSize="2xl" fontWeight="700">
          Reviews ({rn})
        </Text>
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            name={review.name}
            date={review.date}
            rating={review.rating}
            comment={review.comment}
            avatarUrl={review.avatarUrl}
          />
        ))}
      </Stack>
    </Box>
  )
}

const items = [
  {
    label: "Mountain Landscape",
    url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&h=900&q=80",
  },
  {
    label: "Forest Path",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&h=900&q=80",
  },
  {
    label: "Ocean Waves",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=900&q=80",
  },
  {
    label: "Desert Dunes",
    url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&h=900&q=80",
  },
  {
    label: "Sunset Lake",
    url: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&q=80&w=2070",
  },
]

const reviews = [
  {
    id: 1,
    name: "Oshigaki Kisame",
    date: "Mar 12, 2026",
    rating: 5,
    comment:
      "Great quality and very comfortable to use daily. The finish feels premium and holds up well.",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: 2,
    name: "Mira Ibrahim",
    date: "Feb 28, 2026",
    rating: 4,
    comment:
      "Solid product with a clean design. Shipping was fast and packaging was neat.",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
  },
  {
    id: 3,
    name: "Adel Hassan",
    date: "Jan 16, 2026",
    rating: 3,
    comment:
      "Good overall, though I wish the instructions were clearer. Still a decent buy.",
    avatarUrl: "https://i.pravatar.cc/150?img=33",
  },
]


const CarouselThumbnails = ({ items }) => {
  const carousel = useCarouselContext()

  return (
    <HStack justify="center">
      <Carousel.ProgressText mr="4" />
      {items.map((item, index) => (
        <AspectRatio
          key={index}
          ratio={1}
          w="16"
          cursor="pointer"
          onClick={() => carousel.scrollTo(index)}
        >
          <Image
            src={item.url}
            alt={item.label}
            w="100%"
            h="100%"
            objectFit="cover"
          />
        </AspectRatio>
      ))}
    </HStack>
  )
}

export default Product
