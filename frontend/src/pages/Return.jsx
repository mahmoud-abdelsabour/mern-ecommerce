import { Box, Button, HStack, Separator, Stack, Text, Textarea } from "@chakra-ui/react"
import { useMemo, useState } from "react"
import ProductList from "../components/ProductList"
import { ProductCard } from "../components/ProductCard"

const Return = () => {
  const [items, setItems] = useState([
    {
      id: "p-1",
      title: "Wireless Headphones",
      price: 129,
      rating: 4.6,
      brand: "Nimbus",
      category: "Electronics",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      quantity: 1,
      maxQuantity: 1,
      selected: false,
    },
    {
      id: "p-2",
      title: "Smart Watch",
      price: 199,
      rating: 4.4,
      brand: "Vertex",
      category: "Wearables",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      quantity: 1,
      maxQuantity: 2,
      selected: false,
    },
    {
      id: "p-3",
      title: "Running Shoes",
      price: 89,
      rating: 4.2,
      brand: "Atlas",
      category: "Footwear",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      quantity: 1,
      maxQuantity: 1,
      selected: false,
    },
  ])

  const [comments, setComments] = useState("")

  const hasSelected = useMemo(() => items.some((i) => i.selected), [items])

  const toggleSelected = (id, checked) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, selected: Boolean(checked) } : i)))
  }

  const increaseQty = (id) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i
        const next = Math.min(Number(i.maxQuantity ?? i.quantity ?? 1), Number(i.quantity ?? 1) + 1)
        return { ...i, quantity: next }
      })
    )
  }

  const decreaseQty = (id) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i
        const next = Math.max(1, Number(i.quantity ?? 1) - 1)
        return { ...i, quantity: next }
      })
    )
  }

  const onReturn = () => {
    if (!hasSelected) return
    // demo action
    console.log(
      "Return request",
      items.filter((i) => i.selected).map(({ id, quantity }) => ({ id, quantity })),
      comments
    )
  }

  return (
    <Box maxW="1200px" mx="auto" px={4} py={8}>
      <Stack gap={6}>
        <Stack gap={1}>
          <Text fontSize="2xl" fontWeight="900">
            Return Order
          </Text>
          <Text fontSize="sm" color="gray.500">
            Select items and quantities to return.
          </Text>
        </Stack>

        <Stack gap={3}>
          <Text fontSize="lg" fontWeight="800">
            Products
          </Text>
          <ProductList
            items={items}
            variant="return"
            renderItem={(item) => (
              <ProductCard
                key={item.id}
                data={item}
                variant="return"
                selected={item.selected}
                onToggleSelected={(checked) => toggleSelected(item.id, checked)}
                onIncrease={() => increaseQty(item.id)}
                onDecrease={() => decreaseQty(item.id)}
              />
            )}
          />
        </Stack>

        <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4}>
          <Stack gap={3}>
            <Text fontSize="lg" fontWeight="800">
              Comments
            </Text>
            <Separator />
            <Textarea
              placeholder="why you want to return this order"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </Stack>
        </Box>

        <HStack justify="center">
          <Button size="lg" colorScheme="orange" disabled={!hasSelected} onClick={onReturn}>
            Return
          </Button>
        </HStack>
      </Stack>
    </Box>
  )
}

export default Return

