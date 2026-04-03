import { EmptyState, VStack, Flex, Button, Box } from "@chakra-ui/react"
import { LuShoppingCart } from "react-icons/lu"
import { Link as RouterLink } from "react-router-dom"
import ProductList from "../components/ProductList"

const cartItems = [
  {
    id: 1,
    title: "Wireless Headphones",
    price: 129,
    rating: 4.6,
    brand: "Nimbus",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    quantity: 1,
  },
  {
    id: 2,
    title: "Smart Watch",
    price: 199,
    rating: 4.4,
    brand: "Vertex",
    category: "Wearables",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    quantity: 2,
  },
  {
    id: 3,
    title: "Running Shoes",
    price: 89,
    rating: 4.2,
    brand: "Atlas",
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    quantity: 1,
  },
  {
    id: 4,
    title: "Bluetooth Speaker",
    price: 79,
    rating: 4.1,
    brand: "Lumen",
    category: "Audio",
    image: "https://images.unsplash.com/photo-1512446816042-444d6412670b?w=800&q=80",
    quantity: 3,
  },
  {
    id: 5,
    title: "Gaming Mouse",
    price: 59,
    rating: 4.3,
    brand: "Crest",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
    quantity: 1,
  },
  {
    id: 6,
    title: "Hoodie Jacket",
    price: 64,
    rating: 4.0,
    brand: "Aurora",
    category: "Apparel",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    quantity: 2,
  },
  {
    id: 7,
    title: "Travel Backpack",
    price: 99,
    rating: 4.5,
    brand: "Solace",
    category: "Bags",
    image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80",
    quantity: 1,
  },
  {
    id: 8,
    title: "LED Desk Lamp",
    price: 39,
    rating: 4.2,
    brand: "Vertex",
    category: "Home",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
    quantity: 1,
  },
  {
    id: 9,
    title: "Wireless Charger",
    price: 29,
    rating: 4.0,
    brand: "Nimbus",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1518441902117-f7d38f5f4d9f?w=800&q=80",
    quantity: 2,
  },
  {
    id: 10,
    title: "Stainless Bottle",
    price: 24,
    rating: 4.4,
    brand: "Atlas",
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1526401485004-2aa7f3b8f7da?w=800&q=80",
    quantity: 1,
  },
]


const Cart = () => {
  const hasItems = cartItems.length > 0

  return (
    <Box maxW="1200px" mx="auto" px={4} py={8}>
      {hasItems ? (
        <ProductList items={cartItems} variant="cart" />
      ) : (
        <Flex minH="70vh" align="center" justify="center">
          <EmptyState.Root size={"lg"}>
            <EmptyState.Content>
              <EmptyState.Indicator>
                <LuShoppingCart />
              </EmptyState.Indicator>
              <VStack textAlign="center">
                <EmptyState.Title>Your cart is empty</EmptyState.Title>
                <EmptyState.Description>
                  Explore our products and add items to your cart
                </EmptyState.Description>
                <Button as={RouterLink} to="/">
                  Start Shopping
                </Button>
              </VStack>
            </EmptyState.Content>
          </EmptyState.Root>
        </Flex>
      )}
    </Box>
    
  )
}

export default Cart
