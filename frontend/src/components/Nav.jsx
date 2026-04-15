import { useState } from "react"
import logo from "../assets/logo.svg"
import {
  Avatar,
  Box,
  Button,
  Collapsible,
  CloseButton,
  Drawer,
  Flex,
  HStack,
  IconButton,
  Input,
  Link,
  Menu,
  Portal,
  Separator,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import {
  LuChevronDown,
  LuHeart,
  LuLogIn,
  LuMenu,
  LuPackage,
  LuSearch,
  LuShoppingCart,
  LuStore,
  LuTags,
  LuUser,
} from "react-icons/lu"
import { ICON_SIZE } from "../constants/ui"
import { useBrands } from "../hooks/useBrands"
import { useCategories } from "../hooks/useCategories"
import { clearStoredUser } from "../utils/authStorage"
import { useCart } from "../hooks/useCart"
import { useStoredUser } from "../hooks/useStoredUser"

const Nav = () => {
  const navigate = useNavigate()
  const [searchDraft, setSearchDraft] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { data: brandsData, isLoading: brandsLoading } = useBrands()
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories()
  const { data: cartData } = useCart()
  const storedUser = useStoredUser()

  const categories = (categoriesData?.categories ?? []).filter((c) => c?.slug)
  const brands = (brandsData?.brands ?? []).filter((b) => b?.slug)

  const cartCount = Array.isArray(cartData)
    ? cartData.reduce((sum, item) => sum + Number(item?.quantity ?? 0), 0)
    : 0

  const displayName =
    storedUser?.firstName || storedUser?.lastName
      ? `${storedUser?.firstName ?? ""} ${storedUser?.lastName ?? ""}`.trim()
      : storedUser?.username ?? "Guest"

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const submitCatalogSearch = (e) => {
    e.preventDefault()
    const term = searchDraft.trim()
    if (!term) return
    navigate(`/catalog?search=${encodeURIComponent(term)}`)
    closeMobileMenu()
  }

  const onLogout = () => {
    clearStoredUser()
    closeMobileMenu()
    navigate("/login", { replace: true })
  }

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={1100}
      w="100%"
      bg="surface.panel"
      borderBottom="1px solid"
      borderColor="surface.border"
      boxShadow="0 1px 0 rgba(0, 0, 0, 0.04)"
      px={{ base: 4, md: 6 }}
      py={3}
    >
      <Stack maxW="1280px" mx="auto" gap={3}>
        <HStack justify="space-between" align="center" gap={3}>
          <Link as={RouterLink} to="/" display="inline-flex" alignItems="center" onClick={closeMobileMenu}>
            <img src={logo} alt="logo" style={{ height: 40, width: "auto" }} />
          </Link>

          <HStack
            as="form"
            onSubmit={submitCatalogSearch}
            flex="1"
            maxW="560px"
            display={{ base: "none", lg: "flex" }}
            gap={2}
          >
            <Input
              placeholder="Search products, brands, categories..."
              size="sm"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              bg="surface.elevated"
              borderColor="surface.border"
            />
            <IconButton
              type="submit"
              aria-label="Search catalog"
              size="sm"
              colorPalette="brand"
              variant="solid"
            >
              <LuSearch size={ICON_SIZE} />
            </IconButton>
          </HStack>

          <HStack gap={2}>
            <Box position="relative">
              <IconButton
                as={RouterLink}
                to="/cart"
                aria-label="Open cart"
                variant="ghost"
                colorPalette="neutral"
                rounded="full"
              >
                <LuShoppingCart size={ICON_SIZE} />
              </IconButton>
              {cartCount > 0 && (
                <Box
                  position="absolute"
                  top="-1"
                  right="-1"
                  minW="18px"
                  h="18px"
                  px="1"
                  bg="brand.600"
                  color="white"
                  rounded="full"
                  fontSize="xs"
                  fontWeight="700"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  lineHeight="1"
                >
                  {cartCount}
                </Box>
              )}
            </Box>

            <IconButton
              as={RouterLink}
              to="/wishlist"
              aria-label="Open wishlist"
              variant="ghost"
              colorPalette="neutral"
              rounded="full"
            >
              <LuHeart size={ICON_SIZE} />
            </IconButton>

            {storedUser ? (
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button variant="ghost" p={1} minW="unset" rounded="full" aria-label="Open account menu">
                    <Avatar.Root size="sm">
                      <Avatar.Fallback name={displayName} />
                      <Avatar.Image src={storedUser?.profilePhoto ?? undefined} />
                    </Avatar.Root>
                  </Button>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content minW="200px">
                      <Menu.Item asChild value="view-profile">
                        <Link as={RouterLink} to="/me">
                          View profile
                        </Link>
                      </Menu.Item>
                      <Menu.Item asChild value="edit-profile">
                        <Link as={RouterLink} to="/me/edit">
                          Edit profile
                        </Link>
                      </Menu.Item>
                      <Menu.Item value="logout" onClick={onLogout}>
                        Logout
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            ) : (
              <Button
                as={RouterLink}
                to="/login"
                size="sm"
                variant="outline"
                colorPalette="neutral"
                display={{ base: "none", md: "inline-flex" }}
              >
                Login
              </Button>
            )}

            <IconButton
              display={{ base: "inline-flex", lg: "none" }}
              aria-label="Open navigation menu"
              variant="outline"
              colorPalette="neutral"
              onClick={() => setMobileMenuOpen(true)}
            >
              <LuMenu size={ICON_SIZE} />
            </IconButton>
          </HStack>
        </HStack>

        <HStack as="form" onSubmit={submitCatalogSearch} display={{ base: "flex", lg: "none" }} gap={2}>
          <Input
            placeholder="Search products, brands, categories..."
            size="sm"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            bg="surface.elevated"
            borderColor="surface.border"
          />
          <IconButton
            type="submit"
            aria-label="Search catalog"
            size="sm"
            colorPalette="brand"
            variant="solid"
          >
            <LuSearch size={ICON_SIZE} />
          </IconButton>
        </HStack>

        <HStack
          display={{ base: "none", lg: "flex" }}
          justify="space-between"
          align="center"
          gap={4}
          pt={1}
          borderTopWidth="1px"
          borderColor="surface.border"
        >
          <HStack gap={3}>
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button variant="subtle" colorPalette="neutral" size="sm" rounded="full">
                  <HStack gap={1}>
                    <LuTags size={16} />
                    <Text>Categories</Text>
                    <LuChevronDown size={14} />
                  </HStack>
                </Button>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content maxH="320px" overflowY="auto">
                    {categoriesLoading ? (
                      Array.from({ length: 6 }).map((_, idx) => (
                        <Menu.Item key={`categories-skel-${idx}`} value={`categories-skel-${idx}`} disabled>
                          <Skeleton h="12px" w="160px" />
                        </Menu.Item>
                      ))
                    ) : categories.length > 0 ? (
                      categories.map((c) => (
                        <Menu.Item asChild key={c?.id ?? c?._id ?? c?.slug} value={c?.slug ?? c?.name}>
                          <Link as={RouterLink} to={`/catalog?category=${encodeURIComponent(c.slug)}`}>
                            {c?.name ?? c?.slug}
                          </Link>
                        </Menu.Item>
                      ))
                    ) : (
                      <Menu.Item value="categories-empty" disabled>
                        No categories
                      </Menu.Item>
                    )}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>

            <Menu.Root>
              <Menu.Trigger asChild>
                <Button variant="subtle" colorPalette="neutral" size="sm" rounded="full">
                  <HStack gap={1}>
                    <LuStore size={16} />
                    <Text>Brands</Text>
                    <LuChevronDown size={14} />
                  </HStack>
                </Button>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content maxH="320px" overflowY="auto">
                    {brandsLoading ? (
                      Array.from({ length: 6 }).map((_, idx) => (
                        <Menu.Item key={`brands-skel-${idx}`} value={`brands-skel-${idx}`} disabled>
                          <Skeleton h="12px" w="160px" />
                        </Menu.Item>
                      ))
                    ) : brands.length > 0 ? (
                      brands.map((b) => (
                        <Menu.Item asChild key={b?.id ?? b?._id ?? b?.slug} value={b?.slug ?? b?.name}>
                          <Link as={RouterLink} to={`/catalog?brand=${encodeURIComponent(b.slug)}`}>
                            {b?.name ?? b?.slug}
                          </Link>
                        </Menu.Item>
                      ))
                    ) : (
                      <Menu.Item value="brands-empty" disabled>
                        No brands
                      </Menu.Item>
                    )}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </HStack>

          <Button as={RouterLink} to="/orders" variant="ghost" colorPalette="neutral" size="sm">
            <HStack gap={1}>
              <LuPackage size={16} />
              <Text>Orders</Text>
            </HStack>
          </Button>
        </HStack>
      </Stack>

      <Drawer.Root open={mobileMenuOpen} onOpenChange={(e) => setMobileMenuOpen(e.open)} placement="end" size="xs">
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>Menu</Drawer.Title>
                <Drawer.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Drawer.CloseTrigger>
              </Drawer.Header>

              <Drawer.Body>
                <Stack gap={5}>
                  <Stack gap={2}>
                    <Text fontSize="xs" fontWeight="700" letterSpacing="wide" color="text.muted">
                      QUICK LINKS
                    </Text>
                    <HStack gap={2}>
                      <Button as={RouterLink} to="/cart" variant="outline" colorPalette="neutral" size="sm" onClick={closeMobileMenu}>
                        Cart
                      </Button>
                      <Button as={RouterLink} to="/wishlist" variant="outline" colorPalette="neutral" size="sm" onClick={closeMobileMenu}>
                        Wishlist
                      </Button>
                      <Button as={RouterLink} to="/orders" variant="outline" colorPalette="neutral" size="sm" onClick={closeMobileMenu}>
                        Orders
                      </Button>
                    </HStack>
                  </Stack>

                  <Separator />

                  <Collapsible.Root>
                    <Stack gap={2}>
                      <Collapsible.Trigger asChild>
                        <Button
                          variant="subtle"
                          colorPalette="neutral"
                          justifyContent="space-between"
                          size="sm"
                          w="100%"
                          aria-label="Toggle categories"
                        >
                          <HStack gap={2}>
                            <Text fontSize="xs" fontWeight="700" letterSpacing="wide" color="text.muted">
                              CATEGORIES
                            </Text>
                            <Text fontSize="xs" color="text.muted">({categories.length})</Text>
                          </HStack>
                          <Collapsible.Indicator
                            transition="transform 0.2s"
                            _open={{ transform: "rotate(180deg)" }}
                          >
                            <LuChevronDown size={14} />
                          </Collapsible.Indicator>
                        </Button>
                      </Collapsible.Trigger>
                      <Collapsible.Content>
                        <Stack gap={1} maxH="180px" overflowY="auto" pr={1}>
                          {categoriesLoading ? (
                            Array.from({ length: 6 }).map((_, idx) => (
                              <Skeleton key={`mobile-categories-skel-${idx}`} h="28px" rounded="md" />
                            ))
                          ) : categories.length > 0 ? (
                            categories.map((c) => (
                              <Button
                                key={c?.id ?? c?._id ?? c?.slug}
                                as={RouterLink}
                                to={`/catalog?category=${encodeURIComponent(c.slug)}`}
                                justifyContent="flex-start"
                                variant="ghost"
                                colorPalette="neutral"
                                size="sm"
                                onClick={closeMobileMenu}
                              >
                                {c?.name ?? c?.slug}
                              </Button>
                            ))
                          ) : (
                            <Text fontSize="sm" color="text.muted">
                              No categories
                            </Text>
                          )}
                        </Stack>
                      </Collapsible.Content>
                    </Stack>
                  </Collapsible.Root>

                  <Separator />

                  <Collapsible.Root>
                    <Stack gap={2}>
                      <Collapsible.Trigger asChild>
                        <Button
                          variant="subtle"
                          colorPalette="neutral"
                          justifyContent="space-between"
                          size="sm"
                          w="100%"
                          aria-label="Toggle brands"
                        >
                          <HStack gap={2}>
                            <Text fontSize="xs" fontWeight="700" letterSpacing="wide" color="text.muted">
                              BRANDS
                            </Text>
                            <Text fontSize="xs" color="text.muted">({brands.length})</Text>
                          </HStack>
                          <Collapsible.Indicator
                            transition="transform 0.2s"
                            _open={{ transform: "rotate(180deg)" }}
                          >
                            <LuChevronDown size={14} />
                          </Collapsible.Indicator>
                        </Button>
                      </Collapsible.Trigger>
                      <Collapsible.Content>
                        <Stack gap={1} maxH="180px" overflowY="auto" pr={1}>
                          {brandsLoading ? (
                            Array.from({ length: 6 }).map((_, idx) => (
                              <Skeleton key={`mobile-brands-skel-${idx}`} h="28px" rounded="md" />
                            ))
                          ) : brands.length > 0 ? (
                            brands.map((b) => (
                              <Button
                                key={b?.id ?? b?._id ?? b?.slug}
                                as={RouterLink}
                                to={`/catalog?brand=${encodeURIComponent(b.slug)}`}
                                justifyContent="flex-start"
                                variant="ghost"
                                colorPalette="neutral"
                                size="sm"
                                onClick={closeMobileMenu}
                              >
                                {b?.name ?? b?.slug}
                              </Button>
                            ))
                          ) : (
                            <Text fontSize="sm" color="text.muted">
                              No brands
                            </Text>
                          )}
                        </Stack>
                      </Collapsible.Content>
                    </Stack>
                  </Collapsible.Root>

                  <Separator />

                  {storedUser ? (
                    <Stack gap={2}>
                      <Text fontSize="xs" fontWeight="700" letterSpacing="wide" color="text.muted">
                        ACCOUNT
                      </Text>
                      <Button as={RouterLink} to="/me" justifyContent="flex-start" variant="ghost" colorPalette="neutral" size="sm" onClick={closeMobileMenu}>
                        <HStack gap={2}>
                          <LuUser size={16} />
                          <Text>View profile</Text>
                        </HStack>
                      </Button>
                      <Button as={RouterLink} to="/me/edit" justifyContent="flex-start" variant="ghost" colorPalette="neutral" size="sm" onClick={closeMobileMenu}>
                        Edit profile
                      </Button>
                      <Button justifyContent="flex-start" variant="ghost" colorPalette="red" size="sm" onClick={onLogout}>
                        Logout
                      </Button>
                    </Stack>
                  ) : (
                    <Button as={RouterLink} to="/login" colorPalette="brand" onClick={closeMobileMenu}>
                      <HStack gap={2}>
                        <LuLogIn size={16} />
                        <Text>Login</Text>
                      </HStack>
                    </Button>
                  )}
                </Stack>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </Box>
  )
}

export default Nav
