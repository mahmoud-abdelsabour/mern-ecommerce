import { Carousel, IconButton, Box, Button, Flex } from "@chakra-ui/react"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"

const items = [
  "https://picsum.photos/seed/hero-1/1200/500",
  "https://picsum.photos/seed/hero-2/1200/500",
  "https://picsum.photos/seed/hero-3/1200/500",
  "https://picsum.photos/seed/hero-4/1200/500",
  "https://picsum.photos/seed/hero-5/1200/500"
]


const Home = () => {
  return (
        <div>
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
                <Button>Shop Now</Button>
            </Flex>
        </div>
  )
}


export default Home
